import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Route, Map, Home } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="h-6 w-6 text-primary" />
          <Link to="/" className="text-xl font-semibold">
            Route Optimizer
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/trip-planner">
            <Button
              variant={
                location.pathname === "/trip-planner" ? "default" : "ghost"
              }
              className="gap-2"
            >
              <Map className="h-4 w-4" />
              Trip Planner
            </Button>
          </Link>
          <Link to="/app">
            <Button
              variant={location.pathname === "/app" ? "default" : "ghost"}
            >
              Route Designer
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
