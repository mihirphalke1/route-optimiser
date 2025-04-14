import { Button } from "@/components/ui/button";
import {
  MoveRight,
  CheckCircle2,
  MapPin,
  BarChart3,
  Route,
  Navigation,
  Map,
  Network,
  Code,
  Search,
  X,
  Play,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import IndiaRoutePlannerDemo from "@/components/IndiaRoutePlannerDemo";

interface LandingProps {
  wasmLoaded?: boolean;
}

const Landing = ({ wasmLoaded = false }: LandingProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex-grow py-8 sm:py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container flex flex-col items-center gap-4 text-center px-4 sm:px-6">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)]"></div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl/none font-bold tracking-tighter">
              Intelligent Route Optimization
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-sm sm:text-base md:text-xl">
              Powered by Dijkstra's Algorithm and WebAssembly for real-time,
              high-performance route calculations.
            </p>
          </div>

          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center mt-4 sm:mt-6">
            <Link to="/trip-planner">
              <Button size="lg" className="gap-1.5 w-full sm:w-auto">
                Try Trip Planner <Map className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/visualizer">
              <Button size="lg" variant="outline" className="gap-1.5 w-full sm:w-auto">
                Dijkstra Visualizer <Network className="h-4 w-4" />
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

      {/* Trip Planner Section */}
      <section className="py-8 sm:py-12 md:py-24 bg-muted/30 overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 10 L 40 10 M 10 0 L 10 40"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  fill="none"
                  className="text-primary/20"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container relative px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors bg-primary/10 text-primary">
                FEATURED
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Smart Trip Planner
              </h2>
              <p className="text-muted-foreground text-lg">
                Plan optimal routes between multiple locations with our
                intelligent Trip Planner that finds the most efficient paths
                using advanced algorithms.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Location Search</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Search for and add multiple locations to your trip with
                      our intuitive interface
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <Route className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Route Optimization</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Our algorithm finds the most efficient path between all
                      your destinations
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <Map className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">
                      Interactive Visualization
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      View your optimized route on an interactive map with clear
                      directions
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">
                      Time & Distance Analysis
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Get detailed insights about travel times, distances, and
                      efficiency gains
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/trip-planner">
                  <Button
                    size="lg"
                    className="gap-1.5 mt-3 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/10 transition-all"
                  >
                    Plan Your Trip <Map className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Interactive visual demo representation - Indian cities */}
            <IndiaRoutePlannerDemo />
          </div>
        </div>
      </section>

      {/* Algorithm Visualizer Section */}
      <section className="py-12 md:py-24 bg-muted/50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="nodes"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="1"
                  fill="currentColor"
                  className="text-primary/30"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="1"
                  fill="currentColor"
                  className="text-primary/30"
                />
                <circle
                  cx="50"
                  cy="10"
                  r="1"
                  fill="currentColor"
                  className="text-primary/30"
                />
                <circle
                  cx="10"
                  cy="50"
                  r="1"
                  fill="currentColor"
                  className="text-primary/30"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nodes)" />
          </svg>
        </div>

        <div className="container relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-2xl border bg-card">
              {/* Interactive visualizer mockup */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  <span className="font-medium">Dijkstra Visualizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
                    Interactive
                  </Badge>
                </div>
              </div>

              <div className="h-[300px] relative">
                {/* Algorithm visualization canvas */}
                <div className="absolute inset-0 overflow-hidden bg-muted/30">
                  <svg
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    {/* Graph nodes and edges */}
                    <g>
                      {/* Edges with weights */}
                      <line
                        x1="20"
                        y1="20"
                        x2="60"
                        y2="30"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                      />
                      <text
                        x="40"
                        y="22"
                        fontSize="3"
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-foreground"
                      >
                        6
                      </text>

                      <line
                        x1="60"
                        y1="30"
                        x2="80"
                        y2="60"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                      />
                      <text
                        x="72"
                        y="43"
                        fontSize="3"
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-foreground"
                      >
                        4
                      </text>

                      <line
                        x1="80"
                        y1="60"
                        x2="60"
                        y2="80"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                      />
                      <text
                        x="74"
                        y="72"
                        fontSize="3"
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-foreground"
                      >
                        2
                      </text>

                      <line
                        x1="60"
                        y1="80"
                        x2="30"
                        y2="60"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                      />
                      <text
                        x="45"
                        y="73"
                        fontSize="3"
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-foreground"
                      >
                        8
                      </text>

                      <line
                        x1="30"
                        y1="60"
                        x2="20"
                        y2="20"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                      />
                      <text
                        x="24"
                        y="40"
                        fontSize="3"
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-foreground"
                      >
                        9
                      </text>

                      <line
                        x1="20"
                        y1="20"
                        x2="30"
                        y2="60"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                        strokeDasharray="2"
                      />
                      <line
                        x1="30"
                        y1="60"
                        x2="60"
                        y2="30"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        className="text-primary/70"
                        strokeDasharray="2"
                      />

                      {/* Highlight the current path being explored */}
                      <line
                        x1="20"
                        y1="20"
                        x2="60"
                        y2="30"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-green-500"
                        strokeLinecap="round"
                      />
                      <line
                        x1="60"
                        y1="30"
                        x2="80"
                        y2="60"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-green-500"
                        strokeDasharray="1,1"
                        strokeLinecap="round"
                      />

                      {/* Nodes */}
                      <circle
                        cx="20"
                        cy="20"
                        r="4"
                        fill="currentColor"
                        className="text-primary"
                      />
                      <text
                        x="20"
                        y="20"
                        textAnchor="middle"
                        dy=".3em"
                        fill="white"
                        fontSize="3.5"
                      >
                        A
                      </text>

                      <circle
                        cx="60"
                        cy="30"
                        r="4"
                        fill="currentColor"
                        className="text-primary"
                      />
                      <text
                        x="60"
                        y="30"
                        textAnchor="middle"
                        dy=".3em"
                        fill="white"
                        fontSize="3.5"
                      >
                        B
                      </text>

                      <circle
                        cx="80"
                        cy="60"
                        r="4"
                        fill="currentColor"
                        className="text-primary"
                      />
                      <text
                        x="80"
                        y="60"
                        textAnchor="middle"
                        dy=".3em"
                        fill="white"
                        fontSize="3.5"
                      >
                        C
                      </text>

                      <circle
                        cx="60"
                        cy="80"
                        r="4"
                        fill="currentColor"
                        className="text-primary"
                      />
                      <text
                        x="60"
                        y="80"
                        textAnchor="middle"
                        dy=".3em"
                        fill="white"
                        fontSize="3.5"
                      >
                        D
                      </text>

                      <circle
                        cx="30"
                        cy="60"
                        r="4"
                        fill="currentColor"
                        className="text-primary"
                      />
                      <text
                        x="30"
                        y="60"
                        textAnchor="middle"
                        dy=".3em"
                        fill="white"
                        fontSize="3.5"
                      >
                        E
                      </text>

                      {/* Starting Node Highlight */}
                      <circle
                        cx="20"
                        cy="20"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                        className="text-green-500"
                      >
                        <animate
                          attributeName="r"
                          values="5;7;5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Current Node Highlight */}
                      <circle
                        cx="60"
                        cy="30"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                        className="text-yellow-500"
                      >
                        <animate
                          attributeName="r"
                          values="6;8;6"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  </svg>
                </div>

                {/* Algorithm status bar */}
                <div className="absolute bottom-0 left-0 right-0 border-t bg-card/95 py-2 px-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-medium">Current Node:</span> B
                    (distance: 6)
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      Step: <span className="font-medium">2/8</span>
                    </div>
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm p-1 rounded-md shadow-md flex items-center gap-1">
                  <button className="p-1 rounded hover:bg-muted">
                    <Play className="h-4 w-4" />
                  </button>
                  <button className="p-1 rounded hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                  <button className="p-1 rounded hover:bg-muted">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary">
                INTERACTIVE
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Dijkstra's Algorithm Visualizer
              </h2>
              <p className="text-muted-foreground text-lg">
                See how Dijkstra's algorithm finds the shortest path between
                nodes in a graph with our step-by-step interactive visualizer.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Build Your Own Graph</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Create custom graphs with nodes and weighted edges to test
                      different network scenarios
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">
                      Step-by-Step Exploration
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Watch as the algorithm explores the graph and discovers
                      the optimal path
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                    <Code className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Educational Insights</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Understand the inner workings of one of computer science's
                      most important algorithms
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <Link to="/visualizer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-1.5 shadow-lg hover:shadow-sm transition-all"
                  >
                    Launch Visualizer <Network className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-24 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container space-y-12 relative">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary mx-auto">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Plan Your Optimal Journey
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              A simple three-step process to create the most efficient routes
              for your travels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-xl shadow-lg border border-muted hover:border-primary/20 transition-all duration-300 relative">
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                1
              </div>
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/15 transition-colors duration-300">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Add Locations</h3>
              <p className="text-muted-foreground">
                Simply search for and add all the destinations you want to visit
                on your journey.
              </p>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-muted to-transparent mt-2"></div>
              <div className="text-sm text-primary font-medium">
                Fast & Easy Search
              </div>
            </div>

            <div className="group flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-xl shadow-lg border border-muted hover:border-primary/20 transition-all duration-300 relative">
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                2
              </div>
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/15 transition-colors duration-300">
                <Route className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Optimize Route</h3>
              <p className="text-muted-foreground">
                Our intelligent algorithm calculates the most efficient path
                between all your destinations.
              </p>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-muted to-transparent mt-2"></div>
              <div className="text-sm text-primary font-medium">
                Dijkstra's Algorithm
              </div>
            </div>

            <div className="group flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-xl shadow-lg border border-muted hover:border-primary/20 transition-all duration-300 relative">
              <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                3
              </div>
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/15 transition-colors duration-300">
                <Navigation className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Start Your Journey</h3>
              <p className="text-muted-foreground">
                View your optimized route on the interactive map and begin your
                efficient journey.
              </p>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-muted to-transparent mt-2"></div>
              <div className="text-sm text-primary font-medium">
                Real-time Directions
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <Link to="/trip-planner">
              <Button
                size="lg"
                className="gap-1.5 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/10 transition-all"
              >
                Try It Now <MoveRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 md:py-24 bg-muted/30 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="diagonalLines"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary"
              />
              <line
                x1="20"
                y1="0"
                x2="20"
                y2="40"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
          </svg>
        </div>

        <div className="container space-y-10 relative">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary/10 text-primary mx-auto">
              POWERFUL TOOLS
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Key Features
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Our route optimization tools provide powerful features to make
              your journey planning efficient and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-card rounded-xl shadow-md border border-muted hover:shadow-lg transition-all flex gap-4 group">
              <div className="bg-primary/10 p-3 rounded-full h-fit group-hover:bg-primary/20 transition-colors">
                <Route className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Intelligent Route Optimization
                </h3>
                <p className="text-muted-foreground">
                  Our Trip Planner uses advanced algorithms to find the most
                  efficient path between multiple locations, saving you time and
                  resources.
                </p>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-md border border-muted hover:shadow-lg transition-all flex gap-4 group">
              <div className="bg-primary/10 p-3 rounded-full h-fit group-hover:bg-primary/20 transition-colors">
                <Map className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Interactive Map Interface
                </h3>
                <p className="text-muted-foreground">
                  Visualize your entire journey on an interactive map with clear
                  directions, waypoints, and comprehensive distance metrics.
                </p>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-md border border-muted hover:shadow-lg transition-all flex gap-4 group">
              <div className="bg-primary/10 p-3 rounded-full h-fit group-hover:bg-primary/20 transition-colors">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Step-by-Step Visualization
                </h3>
                <p className="text-muted-foreground">
                  Control the animation speed and see each step of the algorithm
                  in detail, including visited nodes and calculated distances.
                </p>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl shadow-md border border-muted hover:shadow-lg transition-all flex gap-4 group">
              <div className="bg-primary/10 p-3 rounded-full h-fit group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Time and Distance Analysis
                </h3>
                <p className="text-muted-foreground">
                  Get detailed information about travel times, distances, and
                  efficiency gains for your optimized route with comparative
                  statistics.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/trip-planner">
              <Button variant="outline" size="lg" className="gap-1.5 px-6">
                Explore All Features <MoveRight className="h-4 w-4 ml-1" />
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

          <a
            href="https://github.com/mihirphalke1/route-optimiser"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors justify-center md:justify-start"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
            View GitHub Repository
          </a>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Route Optimizer.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
