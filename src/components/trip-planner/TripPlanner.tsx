import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TripPlanner.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Search,
  Route,
  RefreshCw,
  MapPin,
  AlertCircle,
  ArrowRight,
  Info,
  Play,
  Pause,
  RotateCcw,
  Home,
  Share2,
  Download,
} from "lucide-react";
import { RouteOptimizer } from "./routeOptimizer";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import RouteAnalysis from "./RouteAnalysis";

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

interface TripPlannerProps {
  defaultCenter?: [number, number];
}

// Custom marker icon
const createCustomIcon = (
  order: number,
  isHighlighted: boolean = false,
  isStart: boolean = false,
  isEnd: boolean = false
) => {
  let className = `custom-marker ${isHighlighted ? "highlighted" : ""}`;
  if (isStart) className += " start-marker";
  if (isEnd) className += " end-marker";

  return L.divIcon({
    className,
    html: `<div class="marker-content">${order}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Map controller component
const MapController: React.FC<{ locations: Location[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

// Algorithm explanation component
const AlgorithmExplanation: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Info className="h-4 w-4 mr-1" /> How It Works
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Understanding the Route Optimization</DialogTitle>
          <DialogDescription>
            This tool uses advanced graph algorithms to find the most efficient
            route between multiple locations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg">
              Step 1: Building the Graph
            </h4>
            <p className="text-sm">
              First, a complete graph is built where each location is a node,
              and paths between locations are edges. The weight of each edge is
              the distance or travel time between the two locations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg">
              Step 2: Applying the Algorithm
            </h4>
            <p className="text-sm">
              For smaller sets of locations (≤10), we use a combination of:
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li>
                <span className="font-medium">Nearest Neighbor Algorithm</span>{" "}
                - A simple greedy approach that always selects the closest
                unvisited location.
              </li>
              <li>
                <span className="font-medium">2-opt Improvement</span> - A local
                optimization technique that swaps connections to remove route
                crossings.
              </li>
              <li>
                <span className="font-medium">Dijkstra's Algorithm</span> - Used
                to find the shortest path between each pair of locations.
              </li>
            </ul>
            <p className="text-sm mt-2">
              For larger sets, we use a simpler approach to maintain
              performance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg">
              Step 3: Constructing the Final Route
            </h4>
            <p className="text-sm">
              The algorithm produces an ordered sequence of locations that
              minimizes the total travel distance or time. The route is then
              visualized on the map with numbered markers and connecting lines.
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md text-sm">
            <p className="font-medium text-blue-800">Why this matters:</p>
            <p className="text-blue-700">
              Finding the optimal route between multiple locations is a complex
              mathematical problem known as the "Traveling Salesperson Problem."
              Without optimization, the number of possible routes grows
              factorially with the number of stops—for just 10 locations, there
              are over 3.6 million possible routes!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TripPlannerHeader: React.FC = () => {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">Smart Trip Planner</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="ghost">Route Designer</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

const TripPlanner = ({ defaultCenter = [51.505, -0.09] }: TripPlannerProps) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [optimalRoute, setOptimalRoute] = useState<[number, number][]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [travelMode, setTravelMode] = useState<
    "driving" | "walking" | "cycling"
  >("driving");
  const [optimizedLocations, setOptimizedLocations] = useState<Location[]>([]);
  const [showOptimizedOrder, setShowOptimizedOrder] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const mapRef = useRef<L.Map>(null);
  const routeOptimizerRef = useRef<RouteOptimizer>(new RouteOptimizer());
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Add debounce to prevent too many API calls
      searchTimeoutRef.current = setTimeout(async () => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "RouteOptimizer/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();
        setSearchResults(data);
      }, 500);
    } catch (error) {
      console.error("Error searching locations:", error);
      toast({
        title: "Search Error",
        description: "Failed to search locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addLocation = (result: any) => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      order: locations.length + 1,
    };

    setLocations([...locations, newLocation]);
    setOptimizedLocations([]);
    setShowOptimizedOrder(false);
    setSearchQuery("");
    setSearchResults([]);
    setOptimalRoute([]);
    setTotalDistance(0);

    toast({
      title: "Location Added",
      description: `${
        result.display_name.split(",")[0]
      } has been added to your trip.`,
    });

    // Center map on new location
    if (mapRef.current) {
      mapRef.current.setView([newLocation.lat, newLocation.lng], 13);
    }
  };

  const removeLocation = (id: string) => {
    const locationToRemove = locations.find((loc) => loc.id === id);
    const updatedLocations = locations
      .filter((loc) => loc.id !== id)
      .map((loc, index) => ({
        ...loc,
        order: index + 1,
      }));

    setLocations(updatedLocations);
    setOptimizedLocations([]);
    setShowOptimizedOrder(false);
    setOptimalRoute([]);
    setTotalDistance(0);

    if (locationToRemove) {
      toast({
        title: "Location Removed",
        description: `${
          locationToRemove.name.split(",")[0]
        } has been removed from your trip.`,
      });
    }
  };

  const calculateOptimalRoute = async () => {
    if (locations.length < 2) {
      toast({
        title: "Not Enough Locations",
        description: "Please add at least two locations to calculate a route.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    setShowOptimizedOrder(false);
    stopAnimation();

    try {
      await routeOptimizerRef.current.buildGraph(locations);
      const { path, totalDistance, orderedLocations } =
        routeOptimizerRef.current.findOptimalRoute(locations[0].id);

      setOptimalRoute(path);
      setTotalDistance(totalDistance);
      setOptimizedLocations(orderedLocations);
      setShowOptimizedOrder(true);

      toast({
        title: "Route Calculated",
        description: `Optimal route found with total distance of ${(
          totalDistance / 1000
        ).toFixed(1)} km.`,
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate the optimal route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const clearRoute = () => {
    setOptimalRoute([]);
    setTotalDistance(0);
    setOptimizedLocations([]);
    setShowOptimizedOrder(false);
    stopAnimation();

    toast({
      title: "Route Cleared",
      description: "The current route has been cleared.",
    });
  };

  const startAnimation = () => {
    if (isAnimating || optimalRoute.length === 0) return;

    setIsAnimating(true);
    setAnimationProgress(0);

    const animateRoute = (timestamp: number) => {
      const duration = 5000; // Animation duration in ms
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateRoute);
      } else {
        setIsAnimating(false);
      }
    };

    const startTime = performance.now();
    animationFrameRef.current = requestAnimationFrame(animateRoute);
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setIsAnimating(false);
    setAnimationProgress(0);
  };

  // Calculate the partial route for animation
  const animatedRoute = React.useMemo(() => {
    if (!isAnimating || optimalRoute.length === 0) return optimalRoute;

    const totalPoints = optimalRoute.length;
    const pointsToDraw = Math.ceil(totalPoints * animationProgress);

    return optimalRoute.slice(0, pointsToDraw);
  }, [optimalRoute, isAnimating, animationProgress]);

  // Display locations in original or optimized order
  const displayLocations = showOptimizedOrder ? optimizedLocations : locations;

  // New function to export route data
  const exportRouteData = () => {
    if (!optimizedLocations.length) return;

    const routeData = {
      locations: optimizedLocations,
      totalDistance,
      routeGeometry: optimalRoute,
    };

    const dataStr = JSON.stringify(routeData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportLink = document.createElement("a");
    exportLink.setAttribute("href", dataUri);
    exportLink.setAttribute("download", "trip-route.json");
    exportLink.click();

    toast({
      title: "Route Exported",
      description: "Your route data has been downloaded as JSON.",
    });
  };

  // New function to share route link
  const shareRoute = () => {
    // In a real app, this would create a shareable link with route data
    // For now, we'll just copy the current URL
    navigator.clipboard.writeText(window.location.href);

    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard!",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel */}
        <div className="w-96 p-4 border-r border-border overflow-y-auto">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchLocations(e.target.value);
                }}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            {isSearching && (
              <div className="flex items-center justify-center p-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="ml-2">Searching...</span>
              </div>
            )}

            {searchResults.length > 0 && (
              <Card className="p-2">
                <ScrollArea className="h-40">
                  {searchResults.map((result) => (
                    <div
                      key={result.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center search-result-item"
                      onClick={() => addLocation(result)}
                    >
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">
                          {result.display_name.split(",")[0]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.display_name
                            .split(",")
                            .slice(1)
                            .join(",")
                            .trim()}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </Card>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Selected Locations</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearRoute}
                    disabled={optimalRoute.length === 0}
                  >
                    Clear Route
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={calculateOptimalRoute}
                    disabled={locations.length < 2 || isCalculating}
                  >
                    {isCalculating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Route className="h-4 w-4 mr-1" />
                    )}
                    Find Best Route
                  </Button>

                  {showOptimizedOrder && optimalRoute.length > 0 && (
                    <RouteAnalysis
                      locations={optimizedLocations}
                      totalDistance={totalDistance}
                      distanceMatrix={routeOptimizerRef.current.distanceMatrix}
                      optimalRoute={optimalRoute}
                    />
                  )}
                </div>
              </div>

              {totalDistance > 0 && (
                <Card className="p-3 mb-2 bg-primary/5 dark:bg-primary/10">
                  <div className="text-sm text-primary dark:text-primary flex items-center justify-between">
                    <span>
                      Total Distance: {(totalDistance / 1000).toFixed(1)} km
                    </span>
                    {showOptimizedOrder && (
                      <Badge variant="secondary">Optimized</Badge>
                    )}
                  </div>

                  {showOptimizedOrder && (
                    <div className="flex justify-between mt-2">
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={
                                  isAnimating ? stopAnimation : startAnimation
                                }
                                disabled={!optimalRoute.length}
                              >
                                {isAnimating ? (
                                  <>
                                    <Pause className="h-3 w-3 mr-1" /> Stop
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3 w-3 mr-1" /> Animate
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>See how the algorithm discovers the route</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={shareRoute}
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share this route</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={exportRouteData}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Export route data</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <AlgorithmExplanation />
                    </div>
                  )}
                </Card>
              )}

              {locations.length === 0 && (
                <Card className="p-4 text-center text-gray-500">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <p>
                    No locations added yet. Search and add locations to plan
                    your trip.
                  </p>
                </Card>
              )}

              <ScrollArea className="h-96">
                {displayLocations.map((location, index) => (
                  <Card key={location.id} className="p-3 mb-2 location-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            index === 0
                              ? "bg-green-500"
                              : index === displayLocations.length - 1
                              ? "bg-red-500"
                              : "bg-blue-500"
                          } text-white flex items-center justify-center text-xs mr-2`}
                        >
                          {location.order}
                        </div>
                        <div>
                          <div className="font-medium">
                            {location.name.split(",")[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      {!showOptimizedOrder && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocation(location.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {showOptimizedOrder &&
                      index < displayLocations.length - 1 && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Separator className="flex-1" />
                          <ArrowRight className="h-3 w-3 mx-2" />
                          <Separator className="flex-1" />
                        </div>
                      )}
                  </Card>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {/* Map settings overlay */}
          <div className="absolute right-4 top-4 z-[1000] flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-background/80 backdrop-blur-sm"
                    onClick={() =>
                      setTravelMode(
                        travelMode === "driving"
                          ? "walking"
                          : travelMode === "walking"
                          ? "cycling"
                          : "driving"
                      )
                    }
                  >
                    {travelMode === "driving"
                      ? "🚗"
                      : travelMode === "walking"
                      ? "🚶"
                      : "🚲"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch travel mode: {travelMode}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            className="map-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <MapController locations={locations} />

            {displayLocations.map((location, index) => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={createCustomIcon(
                  location.order,
                  showOptimizedOrder,
                  index === 0, // isStart
                  index === displayLocations.length - 1 // isEnd
                )}
              >
                <Popup>
                  <div>
                    <div className="font-medium">
                      {location.name.split(",")[0]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {index === 0
                        ? "Start"
                        : index === displayLocations.length - 1
                        ? "End"
                        : `Stop ${location.order}`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {optimalRoute.length > 0 && !isAnimating && (
              <Polyline
                positions={optimalRoute}
                pathOptions={{
                  color: "blue",
                  weight: 4,
                  opacity: 0.7,
                  dashArray: showOptimizedOrder ? undefined : "5, 5",
                }}
              />
            )}

            {isAnimating && animatedRoute.length > 0 && (
              <Polyline
                positions={animatedRoute}
                pathOptions={{
                  color: "blue",
                  weight: 4,
                  opacity: 0.9,
                  className: "animated-path",
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
