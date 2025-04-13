import React from "react";
import TripPlanner from "@/components/trip-planner/TripPlanner";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";

const TripPlannerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Smart Trip Planner</h1>
          <p className="text-muted-foreground">
            Plan your optimal route between multiple destinations
          </p>
        </div>
        <TripPlanner defaultCenter={[19.2183, 72.9781]} />{" "}
        {/* Thane coordinates */}
      </main>
      <Toaster />
    </div>
  );
};

export default TripPlannerPage;
