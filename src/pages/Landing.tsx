import { Button } from "@/components/ui/button";
import {
  MoveRight,
  CheckCircle2,
  MapPin,
  BarChart3,
  Route,
  Navigation,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

interface LandingProps {
  wasmLoaded?: boolean;
}

const Landing = ({ wasmLoaded = false }: LandingProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Bus Route Optimizer</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app">
              <Button variant="ghost">Route Designer</Button>
            </Link>
            <Link to="/trip-planner">
              <Button variant="ghost">Trip Planner</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container flex flex-col items-center gap-4 text-center">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)]"></div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Intelligent Route Optimization
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Powered by Dijkstra's Algorithm and WebAssembly for real-time,
              high-performance route calculations.
            </p>
          </div>

          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center mt-6">
            <Link to="/trip-planner">
              <Button size="lg" className="gap-1.5">
                Try Smart Trip Planner <MoveRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/app">
              <Button size="lg" variant="outline" className="gap-1.5">
                Route Designer <MoveRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {wasmLoaded && (
            <div className="flex items-center gap-1.5 text-sm text-primary mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <span>WebAssembly Ready</span>
            </div>
          )}
        </div>
      </section>

      {/* New Trip Planner Section */}
      <section className="py-12 md:py-24 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary">
                NEW FEATURE
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Smart Trip Planner
              </h2>
              <p className="text-muted-foreground text-lg">
                Plan your journey efficiently with our advanced Smart Trip
                Planner. Enter your destinations and let our algorithm find the
                optimal route connecting all stops.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Search for real-world locations using OpenStreetMap
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Visualize your route with interactive maps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Optimize travel distance using Dijkstra's algorithm
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Animated visualization of the route calculation</span>
                </li>
              </ul>
              <Link to="/trip-planner">
                <Button size="lg" className="gap-1.5">
                  Plan Your Trip <Navigation className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl border">
              <div className="aspect-video bg-black/10 dark:bg-white/5 relative flex items-center justify-center">
                <Map className="h-24 w-24 text-primary/40" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-24 bg-muted/50">
        <div className="container space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              A visual guide to using our route optimization tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">1. Add Locations</h3>
              <p className="text-muted-foreground">
                Search for real-world locations or click on the map to add stops
                to your journey.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full">
                <Route className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">2. Create Connections</h3>
              <p className="text-muted-foreground">
                Our system automatically connects your stops and calculates
                travel distances.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 bg-card rounded-lg shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">3. Calculate Optimal Route</h3>
              <p className="text-muted-foreground">
                Click "Find Best Route" and watch as the algorithm calculates
                and animates the most efficient path.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 md:py-24">
        <div className="container space-y-8">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Key Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Real-world Mapping</h3>
              <p className="text-muted-foreground">
                Import real geographic locations using OpenStreetMap integration
                and calculate true distances.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">
                High-Performance WebAssembly
              </h3>
              <p className="text-muted-foreground">
                Our algorithm runs at near-native speed thanks to C++ compiled
                to WebAssembly for complex graphs.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">
                Step-by-Step Visualization
              </h3>
              <p className="text-muted-foreground">
                Watch Dijkstra's algorithm in action with animated
                visualizations of each decision step.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Smart Trip Planning</h3>
              <p className="text-muted-foreground">
                Plan multi-stop trips with automatic route optimization to save
                time and fuel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-24 bg-primary/5">
        <div className="container flex flex-col items-center text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Ready to Optimize Your Routes?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Try our interactive tools and see how efficient your journeys can
            be.
          </p>
          <div className="flex gap-4 mt-4">
            <Link to="/trip-planner">
              <Button size="lg" className="gap-1.5">
                Smart Trip Planner <Navigation className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/app">
              <Button size="lg" variant="outline">
                Route Designer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Route Optimizer</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Route Mapper Flow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
