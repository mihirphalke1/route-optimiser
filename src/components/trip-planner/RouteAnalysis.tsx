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
import { BarChart3, ChevronRight, FileSpreadsheet, Route } from "lucide-react";
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
        <Button variant="default" size="sm" className="gap-2 w-full">
          <BarChart3 className="h-4 w-4" />
          <span>Route Analysis</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col z-[2000]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Route Optimization Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of the optimal route between all selected
            locations
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Route Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary opacity-80" />
              Route Summary
            </h3>
            <Card className="p-5 bg-primary/5 dark:bg-primary/10 border-primary/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Distance
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {(totalDistance / 1000).toFixed(2)} km
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Number of Stops
                  </div>
                  <div className="text-xl font-bold">
                    {locations.length} location
                    {locations.length !== 1 ? "s" : ""}
                  </div>
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
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Route className="h-5 w-5 text-primary opacity-80" />
              Step-by-Step Route
            </h3>
            <ScrollArea className="h-56">
              <div className="space-y-3">
                {routeSegments.map((segment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-md border border-muted bg-background/50"
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium">
                          {getShortName(segment.from.name)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">
                          {getShortName(segment.to.name)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="inline-flex items-center">
                          Distance:{" "}
                          <span className="font-medium ml-1">
                            {(segment.distance / 1000).toFixed(2)} km
                          </span>
                        </span>
                        <span className="mx-2">•</span>
                        <span className="inline-flex items-center">
                          Running total:{" "}
                          <span className="font-medium ml-1">
                            {(segment.cumulativeDistance / 1000).toFixed(2)} km
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Adjacency Matrix - Distance between all points */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="text-primary opacity-80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 3v18" />
              </svg>
              Distance Matrix
            </h3>
            <p className="text-sm text-muted-foreground mb-3 max-w-3xl">
              The distance matrix shows the distance (in km) between each pair
              of locations. The optimization algorithm uses this data to find
              the shortest path visiting all locations.
            </p>
            <div className="border rounded-md">
              <ScrollArea className="h-64 w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[100px] font-bold">
                        From \ To
                      </TableHead>
                      {locations.map((loc) => (
                        <TableHead key={loc.id} className="font-bold">
                          {getShortName(loc.name)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((fromLoc) => (
                      <TableRow key={fromLoc.id}>
                        <TableCell className="font-medium bg-muted/20">
                          {getShortName(fromLoc.name)}
                        </TableCell>
                        {locations.map((toLoc) => (
                          <TableCell
                            key={toLoc.id}
                            className={
                              fromLoc.id === toLoc.id
                                ? "bg-muted/40 text-muted-foreground"
                                : ""
                            }
                          >
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
          </div>

          {/* Why This Route Section */}
          <div className="bg-primary/5 dark:bg-primary/10 border-primary/20 rounded-lg p-5 mb-3">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="opacity-80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Why This Route Is Optimal
            </h3>
            <div className="text-sm space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <p>
                  <span className="font-medium">Algorithm combination:</span>{" "}
                  The route was calculated using a combination of Dijkstra's
                  algorithm and the Nearest Neighbor algorithm with 2-opt
                  improvement to solve the Traveling Salesperson Problem.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <p>
                  <span className="font-medium">Computational efficiency:</span>{" "}
                  Out of the{" "}
                  <span className="font-bold text-primary">
                    {locations.length > 0
                      ? factorial(locations.length - 1).toLocaleString()
                      : 0}{" "}
                  </span>
                  possible routes, this is the shortest path that visits all
                  locations and returns to the starting point.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <p>
                  <span className="font-medium">Real-world navigation:</span>{" "}
                  Each segment between locations is optimized using real-world
                  road distances rather than straight-line distances, ensuring
                  that the route follows actual roads and highways.
                </p>
              </div>
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
