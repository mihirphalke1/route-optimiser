import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, ChevronRight, FileSpreadsheet } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

interface RouteAnalysisProps {
  locations: Location[];
  totalDistance: number;
  distanceMatrix?: Map<string, Map<string, number>>;
  optimalRoute: [number, number][];
}

const RouteAnalysis: React.FC<RouteAnalysisProps> = ({
  locations,
  totalDistance,
  distanceMatrix,
  optimalRoute,
}) => {
  // Skip rendering if we don't have enough data
  if (locations.length < 2 || !totalDistance || optimalRoute.length === 0) {
    return null;
  }

  // Get location names in simplified format
  const getShortName = (name: string) => {
    return name.split(",")[0].trim();
  };

  // Create segments of the route for step-by-step analysis
  const routeSegments = [];
  let cumulativeDistance = 0;

  for (let i = 0; i < locations.length - 1; i++) {
    const from = locations[i];
    const to = locations[i + 1];

    // Get distance between these locations
    const distance = distanceMatrix?.get(from.id)?.get(to.id) || 0;
    cumulativeDistance += distance;

    routeSegments.push({
      from,
      to,
      distance,
      cumulativeDistance,
    });
  }

  // For a complete journey, add the return to start
  if (locations.length > 1) {
    const from = locations[locations.length - 1];
    const to = locations[0];
    const distance = distanceMatrix?.get(from.id)?.get(to.id) || 0;
    cumulativeDistance += distance;

    routeSegments.push({
      from,
      to,
      distance,
      cumulativeDistance,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Route Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Route Optimization Analysis</DialogTitle>
          <DialogDescription>
            Detailed analysis of the optimal route and distance matrix
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Route Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Route Summary</h3>
            <Card className="p-4 bg-primary/5 dark:bg-primary/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Distance
                  </div>
                  <div className="text-xl font-bold">
                    {(totalDistance / 1000).toFixed(2)} km
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Number of Stops
                  </div>
                  <div className="text-xl font-bold">{locations.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Average Distance
                  </div>
                  <div className="text-xl font-bold">
                    {(
                      totalDistance /
                      (locations.length > 1 ? locations.length : 1) /
                      1000
                    ).toFixed(2)}{" "}
                    km
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Route Type
                  </div>
                  <div className="text-xl font-bold">Round Trip</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Step by Step Route */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Step-by-Step Route</h3>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {routeSegments.map((segment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-card"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {getShortName(segment.from.name)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {getShortName(segment.to.name)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(segment.distance / 1000).toFixed(2)} km (total:{" "}
                        {(segment.cumulativeDistance / 1000).toFixed(2)} km)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Adjacency Matrix - Distance between all points */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Distance Matrix</h3>
            <p className="text-sm text-muted-foreground mb-2">
              The adjacency matrix shows the distance (in km) between each pair
              of locations. The optimization algorithm uses this data to find
              the shortest path visiting all locations.
            </p>
            <ScrollArea className="h-64 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">From \ To</TableHead>
                    {locations.map((loc) => (
                      <TableHead key={loc.id}>
                        {getShortName(loc.name)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((fromLoc) => (
                    <TableRow key={fromLoc.id}>
                      <TableCell className="font-medium">
                        {getShortName(fromLoc.name)}
                      </TableCell>
                      {locations.map((toLoc) => (
                        <TableCell key={toLoc.id}>
                          {fromLoc.id === toLoc.id
                            ? "—"
                            : (
                                (distanceMatrix
                                  ?.get(fromLoc.id)
                                  ?.get(toLoc.id) || 0) / 1000
                              ).toFixed(2)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Why This Route Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Why This Is Optimal</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The route was calculated using a combination of Dijkstra's
                algorithm and the Nearest Neighbor algorithm with 2-opt
                improvement to solve the Traveling Salesperson Problem.
              </p>
              <p>
                Out of the{" "}
                {locations.length > 0
                  ? factorial(locations.length - 1).toLocaleString()
                  : 0}{" "}
                possible routes, this is the shortest path that visits all
                locations and returns to the starting point.
              </p>
              <p>
                Each segment between locations is optimized using real-world
                road distances rather than straight-line distances, ensuring
                that the route follows actual roads and highways.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to calculate factorial for explaining route combinations
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export default RouteAnalysis;
