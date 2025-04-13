
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusRoute, BusStop, MetricType } from "@/types/graph";
import { AlertTriangle, Bus, Trash } from "lucide-react";
import { toast } from "sonner";

interface ControlPanelProps {
  nodes: BusStop[];
  sourceNodeId: string | null;
  destinationNodeId: string | null;
  onCalculateRoute: () => void;
  onResetGraph: () => void;
  isCalculating: boolean;
  metric: MetricType;
  setMetric: (metric: MetricType) => void;
  hasResult: boolean;
  noPathFound: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  nodes,
  sourceNodeId,
  destinationNodeId,
  onCalculateRoute,
  onResetGraph,
  isCalculating,
  metric,
  setMetric,
  hasResult,
  noPathFound
}) => {
  // Get the source and destination nodes
  const sourceNode = nodes.find(node => node.id === sourceNodeId);
  const destinationNode = nodes.find(node => node.id === destinationNodeId);
  
  // Validate if we can calculate a route
  const canCalculate = 
    sourceNodeId !== null && 
    destinationNodeId !== null && 
    sourceNodeId !== destinationNodeId && 
    !isCalculating;
  
  const handleMetricChange = (value: string) => {
    setMetric(value as MetricType);
  };
  
  const handleCalculate = () => {
    if (!canCalculate) {
      if (!sourceNodeId) {
        toast.error("Start point not selected", {
          description: "Hold Shift and click on a bus stop to set it as the start point."
        });
      } else if (!destinationNodeId) {
        toast.error("Destination not selected", {
          description: "Hold Alt and click on a bus stop to set it as the destination."
        });
      } else if (sourceNodeId === destinationNodeId) {
        toast.error("Invalid selection", {
          description: "Start and destination points must be different."
        });
      }
      return;
    }
    
    onCalculateRoute();
  };
  
  const handleReset = () => {
    onResetGraph();
    toast("Graph has been reset", {
      description: "All stops and routes have been cleared."
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Route Controls</CardTitle>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleReset}
            className="h-8"
          >
            <Trash className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        <CardDescription>
          Configure and calculate the optimal bus route
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Points Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Start Point</p>
              <div className="flex items-center p-2 bg-muted rounded-md">
                {sourceNode ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span>{sourceNode.label}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Hold Shift + click on a stop
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Destination</p>
              <div className="flex items-center p-2 bg-muted rounded-md">
                {destinationNode ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span>{destinationNode.label}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Hold Alt + click on a stop
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Optimization Metric */}
          <div>
            <p className="text-sm font-medium mb-1">Optimize By</p>
            <Select value={metric} onValueChange={handleMetricChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Warning for no path */}
          {noPathFound && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p className="text-sm">
                No valid route found between these stops. Try connecting them or selecting different stops.
              </p>
            </div>
          )}
          
          {/* Calculate Button */}
          <Button 
            className="w-full"
            onClick={handleCalculate}
            disabled={!canCalculate}
          >
            {isCalculating ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Calculating...
              </div>
            ) : (
              <div className="flex items-center">
                <Bus className="h-4 w-4 mr-2" />
                {hasResult ? "Recalculate Route" : "Find Best Route"}
              </div>
            )}
          </Button>
          
          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 mt-4">
            <p>• Click on the canvas to add a new bus stop</p>
            <p>• Select a stop and use the + icon to connect it to another stop</p>
            <p>• Double-click any stop or route to delete it</p>
            <p>• Drag stops to reposition them on the map</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
