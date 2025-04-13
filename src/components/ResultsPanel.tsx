
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusRoute, BusStop, DijkstraResult, MetricType } from "@/types/graph";
import { ArrowRight, MapPin } from "lucide-react";

interface ResultsPanelProps {
  result: DijkstraResult | null;
  nodes: BusStop[];
  edges: BusRoute[];
  metric: MetricType;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  nodes,
  edges,
  metric
}) => {
  if (!result || !result.path.length) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Route Results</CardTitle>
          <CardDescription>
            Calculate a route to see the results here
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">
            No route calculated yet
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Get the metric label
  const metricLabel = {
    cost: 'Cost',
    time: 'Time',
    distance: 'Distance'
  }[metric];
  
  // Get the metric unit
  const metricUnit = {
    cost: '$',
    time: 'min',
    distance: 'km'
  }[metric];
  
  // Format the route stops
  const routeStops = result.path.map(nodeId => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.label : 'Unknown Stop';
  });
  
  // Calculate total metric value by summing the edges in the path
  let totalMetricValue = 0;
  
  for (let i = 0; i < result.path.length - 1; i++) {
    const fromNodeId = result.path[i];
    const toNodeId = result.path[i + 1];
    
    const edge = edges.find(e => 
      (e.source === fromNodeId && e.target === toNodeId) || 
      (e.source === toNodeId && e.target === fromNodeId)
    );
    
    if (edge) {
      totalMetricValue += edge[metric] || edge.cost;
    }
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle>Optimal Route Found</CardTitle>
        <CardDescription>
          {routeStops.length} stops · {metricLabel}: {totalMetricValue.toFixed(1)} {metricUnit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="space-y-3">
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Route Stops</h4>
              <div className="space-y-1">
                {routeStops.map((stop, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{stop}</span>
                    </div>
                    {index < routeStops.length - 1 && (
                      <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Algorithm Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Nodes Visited</p>
                  <p className="text-sm font-medium">
                    {result.steps[result.steps.length - 1]?.visitedNodes.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Algorithm Steps</p>
                  <p className="text-sm font-medium">{result.steps.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total {metricLabel}</p>
                  <p className="text-sm font-medium">{totalMetricValue.toFixed(1)} {metricUnit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stops Traversed</p>
                  <p className="text-sm font-medium">{routeStops.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
