import ThemeToggle from "./ThemeToggle";
import { Bus, Github, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";

const AppHeader = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <Bus className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Route Optimizer</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Information"
        >
          <Info className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open("https://github.com", "_blank")}
          aria-label="GitHub"
        >
          <Github className="h-5 w-5" />
        </Button>

        <ThemeToggle />
      </div>

      {showInfo && (
        <div className="absolute top-16 right-4 z-50 w-80 animate-fade-in">
          <Card>
            <CardContent className="pt-4 text-sm">
              <h3 className="font-bold mb-2">About Bus Route Optimizer</h3>
              <p className="mb-2">
                This application demonstrates Dijkstra's Algorithm for finding
                the shortest path between bus stops.
              </p>
              <p className="mb-2">
                Create a network of bus stops and routes, then calculate the
                optimal path based on cost, time, or distance.
              </p>
              <p className="mb-2">
                Watch the algorithm in action with step-by-step animations
                showing how it explores the network to find the best route.
              </p>
              <div className="flex justify-end mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInfo(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AppHeader;
