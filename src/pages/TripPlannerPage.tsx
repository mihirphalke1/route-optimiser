import React from "react";
import TripPlanner from "@/components/trip-planner/TripPlanner";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";

const TripPlannerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="container py-6 px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-2">Smart Trip Planner</h1>
          <p className="text-muted-foreground max-w-3xl mb-3">
            Plan the most efficient routes between multiple destinations using
            advanced routing algorithms. Simply search and add locations, then
            let our optimizer find the shortest path for your journey.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Save time & fuel
            </div>
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Optimized routes
            </div>
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Interactive planning
            </div>
          </div>
        </div>
        <div className="container px-4 md:px-6 pb-6 flex-1">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden h-full">
            <TripPlanner defaultCenter={[19.2183, 72.9781]} />
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default TripPlannerPage;
