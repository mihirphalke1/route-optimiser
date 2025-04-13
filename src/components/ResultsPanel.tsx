import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edge, NodePoint, DijkstraResult, MetricType } from "@/types/graph";
import { ArrowRight, Network, Activity } from "lucide-react";

interface ResultsPanelProps {
  result: DijkstraResult | null;
  nodes: NodePoint[];
  edges: Edge[];
  metric: MetricType;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  nodes,
  edges,
  metric,
}) => {
  if (!result || !result.path.length) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Algorithm Results</CardTitle>
          <CardDescription>
            Run the algorithm to see the results here
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No algorithm results yet</p>
        </CardContent>
      </Card>
    );
  }

  // Get the metric label
  const metricLabel = {
    cost: "Cost",
    time: "Time",
    distance: "Distance",
  }[metric];

  // Get the metric unit
  const metricUnit = {
    cost: "units",
    time: "min",
    distance: "km",
  }[metric];

  // Format the path nodes
  const pathNodes = result.path.map((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.label : "Unknown Node";
  });

  // Calculate total metric value by summing the edges in the path
  let totalMetricValue = 0;

  for (let i = 0; i < result.path.length - 1; i++) {
    const fromNodeId = result.path[i];
    const toNodeId = result.path[i + 1];

    const edge = edges.find(
      (e) =>
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
        <CardTitle>Shortest Path Found</CardTitle>
        <CardDescription>
          {pathNodes.length} nodes · {metricLabel}:{" "}
          {totalMetricValue.toFixed(1)} {metricUnit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="space-y-3">
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Path Sequence</h4>
              <div className="space-y-1">
                {pathNodes.map((node, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex items-center">
                      <Network className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{node}</span>
                    </div>
                    {index < pathNodes.length - 1 && (
                      <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">Algorithm Metrics</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Visited Nodes</p>
                  <p className="text-sm font-medium">
                    {result.steps[result.steps.length - 1]?.visitedNodes
                      .length || 0}{" "}
                    of {nodes.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Algorithm Steps
                  </p>
                  <p className="text-sm font-medium">{result.steps.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total {metricLabel}
                  </p>
                  <p className="text-sm font-medium">
                    {totalMetricValue.toFixed(1)} {metricUnit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Path Length</p>
                  <p className="text-sm font-medium">
                    {pathNodes.length} nodes
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-2">What We're Seeing</h4>
              <p className="text-xs text-muted-foreground">
                Dijkstra's algorithm works by assigning tentative distances to
                each node and progressively visiting the unvisited node with the
                smallest tentative distance. It then updates the distances of
                neighboring nodes if a shorter path is found through the current
                node.
              </p>
              <div className="mt-2 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-primary" />
                <p className="text-xs font-medium text-primary">
                  Watch the animation to see the algorithm in action
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
