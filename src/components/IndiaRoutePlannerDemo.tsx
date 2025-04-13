import React, { useState, useEffect } from "react";
import {
  Map,
  Route,
  BarChart3,
  RefreshCw,
  X,
  Play,
  Download,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const IndiaRoutePlannerDemo = () => {
  const [step, setStep] = useState(1);

  // Cycle through steps automatically for the demo
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prevStep) => (prevStep >= 3 ? 1 : prevStep + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <span className="font-medium">Optimized Trip Planner</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
            Interactive Demo
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[400px] relative">
        {/* Step Indicator */}
        <div className="absolute top-2 left-2 z-10 bg-card/90 backdrop-blur-sm py-1 px-2 rounded-md shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex">
              <div
                className={`w-2 h-2 rounded-full ${
                  step === 1 ? "bg-primary animate-pulse" : "bg-primary/50"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  step === 2 ? "bg-primary animate-pulse" : "bg-primary/50"
                } mx-1`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  step === 3 ? "bg-primary animate-pulse" : "bg-primary/50"
                }`}
              ></div>
            </div>
            <span className="text-xs font-medium">
              {step === 1 && "Step 1: Add Locations"}
              {step === 2 && "Step 2: Optimize Route"}
              {step === 3 && "Step 3: Analyze Journey"}
            </span>
          </div>
        </div>

        {/* Indian cities trip planner workflow */}
        <div className="w-full md:w-1/3 border-r p-3 flex flex-col h-full bg-background/50">
          <div className="text-xs text-muted-foreground mb-2">
            Plan Your India Trip
          </div>
          <div className="space-y-2 flex-1">
            <div className="p-2 rounded-md border bg-primary/5 flex items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">
                1
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Mumbai</div>
                <div className="text-xs text-muted-foreground">
                  Starting Point
                </div>
              </div>
              <X className="h-4 w-4 text-muted-foreground opacity-50" />
            </div>

            <div className="p-2 rounded-md border bg-primary/5 flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-2">
                2
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Pune</div>
                <div className="text-xs text-muted-foreground">
                  Historical Sites
                </div>
              </div>
              <X className="h-4 w-4 text-muted-foreground opacity-50" />
            </div>

            <div
              className={`p-2 rounded-md border bg-primary/5 flex items-center ${
                step === 1 ? "animate-pulse" : ""
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-2">
                3
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Lonavala</div>
                <div className="text-xs text-muted-foreground">
                  Hill Station
                </div>
              </div>
              <X className="h-4 w-4 text-muted-foreground opacity-50" />
            </div>

            <div className="p-2 rounded-md border bg-primary/5 flex items-center">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-2">
                4
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium">Nashik</div>
                <div className="text-xs text-muted-foreground">
                  Vineyard Tour
                </div>
              </div>
              <X className="h-4 w-4 text-muted-foreground opacity-50" />
            </div>

            <div className="p-2 rounded-md border bg-muted/50 flex items-center">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs mr-2">
                +
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                Search for more places...
              </div>
            </div>
          </div>
          <Button
            size="sm"
            className={`w-full gap-1.5 mt-2 ${
              step >= 2 ? "bg-green-500 hover:bg-green-600" : "bg-primary"
            }`}
          >
            {step === 1 ? (
              <>
                <Route className="h-3.5 w-3.5" /> Find Best Route
              </>
            ) : step === 2 ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Optimizing...
              </>
            ) : (
              <>
                <BarChart3 className="h-3.5 w-3.5" /> View Analysis
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 relative bg-muted/30">
          {/* Maharashtra map visualization */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%]">
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Map grid */}
                <g
                  stroke="currentColor"
                  className="text-primary/10"
                  strokeWidth="0.3"
                >
                  <line x1="0" y1="20" x2="100" y2="20" />
                  <line x1="0" y1="40" x2="100" y2="40" />
                  <line x1="0" y1="60" x2="100" y2="60" />
                  <line x1="0" y1="80" x2="100" y2="80" />
                  <line x1="20" y1="0" x2="20" y2="100" />
                  <line x1="40" y1="0" x2="40" y2="100" />
                  <line x1="60" y1="0" x2="60" y2="100" />
                  <line x1="80" y1="0" x2="80" y2="100" />
                </g>

                {/* Maharashtra approximate shape - more accurate */}
                <path
                  d="M15,60 C25,75 35,80 50,80 C65,80 75,70 80,60 C85,50 85,30 75,20 C65,15 50,25 40,15 C30,10 20,20 15,30 C10,50 10,55 15,60 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-foreground/20"
                />

                {/* Logical route path - Mumbai to Lonavala to Pune to Nashik to Mumbai */}
                {step >= 2 && (
                  <path
                    d="M15,55 L30,50 L45,60 L40,30 L15,55"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary"
                    strokeDasharray="1"
                    strokeDashoffset={step === 2 ? "100" : "0"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {step === 2 && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="100"
                        to="0"
                        dur="4s"
                        fill="freeze"
                      />
                    )}
                  </path>
                )}

                {/* Location markers - more geographically accurate */}
                <g>
                  {/* Mumbai - west coast */}
                  <circle
                    cx="15"
                    cy="55"
                    r="4"
                    className="text-green-500 fill-current"
                  >
                    <animate
                      attributeName="r"
                      values="3;5;3"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <text
                    x="15"
                    y="55"
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="4"
                  >
                    1
                  </text>
                  <text
                    x="15"
                    y="65"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="3"
                    className="text-foreground"
                  >
                    Mumbai
                  </text>

                  {/* Lonavala - between Mumbai and Pune */}
                  <circle
                    cx="30"
                    cy="50"
                    r="4"
                    className="text-primary fill-current"
                  >
                    {step === 1 && (
                      <animate
                        attributeName="r"
                        values="4;6;4"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  <text
                    x="30"
                    y="50"
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="4"
                  >
                    2
                  </text>
                  <text
                    x="30"
                    y="60"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="3"
                    className="text-foreground"
                  >
                    Lonavala
                  </text>

                  {/* Pune - east of Mumbai */}
                  <circle
                    cx="45"
                    cy="60"
                    r="4"
                    className="text-primary fill-current"
                  />
                  <text
                    x="45"
                    y="60"
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="4"
                  >
                    3
                  </text>
                  <text
                    x="45"
                    y="70"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="3"
                    className="text-foreground"
                  >
                    Pune
                  </text>

                  {/* Nashik - north of Pune */}
                  <circle
                    cx="40"
                    cy="30"
                    r="4"
                    className="text-primary fill-current"
                  />
                  <text
                    x="40"
                    y="30"
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="4"
                  >
                    4
                  </text>
                  <text
                    x="40"
                    y="40"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="3"
                    className="text-foreground"
                  >
                    Nashik
                  </text>
                </g>

                {/* Route Analysis popup - animates in */}
                {step === 3 && (
                  <g className="route-analysis-popup">
                    <rect
                      x="55"
                      y="10"
                      width="35"
                      height="15"
                      rx="2"
                      fill="currentColor"
                      className="text-card border-border"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;1"
                        dur="0.5s"
                        fill="freeze"
                      />
                    </rect>
                    <text
                      x="58"
                      y="15"
                      fill="currentColor"
                      fontSize="2.5"
                      className="text-foreground font-medium"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;1"
                        dur="0.5s"
                        fill="freeze"
                      />
                      Route Analysis
                    </text>
                    <text
                      x="58"
                      y="19"
                      fill="currentColor"
                      fontSize="2"
                      className="text-muted-foreground"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;1"
                        dur="0.5s"
                        fill="freeze"
                      />
                      Total: 513 km (6.5 hrs)
                    </text>
                    <text
                      x="58"
                      y="22"
                      fill="currentColor"
                      fontSize="2"
                      className="text-primary"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;1"
                        dur="0.5s"
                        fill="freeze"
                      />
                      Optimized ✓
                    </text>
                  </g>
                )}

                {/* Distance labels on route paths */}
                {step >= 2 && (
                  <g>
                    {/* Mumbai to Lonavala */}
                    <text
                      x="22"
                      y="50"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="2.5"
                      className="text-primary font-medium"
                      opacity={step === 3 ? "1" : "0"}
                    >
                      {step === 2 && (
                        <animate
                          attributeName="opacity"
                          values="0;1"
                          dur="1s"
                          begin="1s"
                          fill="freeze"
                        />
                      )}
                      83 km
                    </text>

                    {/* Lonavala to Pune */}
                    <text
                      x="37"
                      y="57"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="2.5"
                      className="text-primary font-medium"
                      opacity={step === 3 ? "1" : "0"}
                    >
                      {step === 2 && (
                        <animate
                          attributeName="opacity"
                          values="0;1"
                          dur="1s"
                          begin="2s"
                          fill="freeze"
                        />
                      )}
                      64 km
                    </text>

                    {/* Pune to Nashik */}
                    <text
                      x="42"
                      y="45"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="2.5"
                      className="text-primary font-medium"
                      opacity={step === 3 ? "1" : "0"}
                    >
                      {step === 2 && (
                        <animate
                          attributeName="opacity"
                          values="0;1"
                          dur="1s"
                          begin="3s"
                          fill="freeze"
                        />
                      )}
                      200 km
                    </text>

                    {/* Nashik to Mumbai (closing the loop) */}
                    <text
                      x="25"
                      y="35"
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="2.5"
                      className="text-primary font-medium"
                      opacity={step === 3 ? "1" : "0"}
                    >
                      {step === 2 && (
                        <animate
                          attributeName="opacity"
                          values="0;1"
                          dur="1s"
                          begin="4s"
                          fill="freeze"
                        />
                      )}
                      166 km
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm p-1 rounded-md shadow-md flex items-center gap-1">
            <button className="p-1 rounded hover:bg-muted">
              <Play className="h-4 w-4" />
            </button>
            <button className="p-1 rounded hover:bg-muted">
              <BarChart3 className="h-4 w-4" />
            </button>
            <button className="p-1 rounded hover:bg-muted">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Distance summary */}
          <div
            className={`absolute bottom-2 left-2 right-2 bg-card/90 backdrop-blur-sm py-1.5 px-3 rounded-md shadow-md text-xs flex justify-between items-center ${
              step < 2 ? "opacity-0" : "opacity-100"
            } transition-opacity duration-500`}
          >
            <div>
              Total Distance: <span className="font-medium">513 km</span>
            </div>
            <div>
              Est. Time: <span className="font-medium">6.5 hrs</span>
            </div>
            <div className="text-primary font-medium">
              {step === 2 ? "Calculating..." : "Optimized ✓"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaRoutePlannerDemo;
