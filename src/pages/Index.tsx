import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import GraphCanvas from "@/components/GraphCanvas";
import ControlPanel from "@/components/ControlPanel";
import ResultsPanel from "@/components/ResultsPanel";
import {
  BusRoute,
  BusStop,
  DijkstraResult,
  MetricType,
  Position,
} from "@/types/graph";
import { dijkstra } from "@/utils/dijkstra";
import { toast } from "sonner";

const Index = () => {
  // Graph state
  const [nodes, setNodes] = useState<BusStop[]>([]);
  const [edges, setEdges] = useState<BusRoute[]>([]);

  // Selection state
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [destinationNodeId, setDestinationNodeId] = useState<string | null>(
    null
  );

  // Algorithm state
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<DijkstraResult | null>(null);
  const [metric, setMetric] = useState<MetricType>("cost");

  // Handle adding a node
  const handleNodeAdd = (node: BusStop) => {
    setNodes((prevNodes) => [...prevNodes, node]);
  };

  // Handle moving a node
  const handleNodeMove = (id: string, position: Position) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === id ? { ...node, position } : node))
    );
  };

  // Handle deleting a node
  const handleNodeDelete = (id: string) => {
    // Remove the node
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));

    // Remove all edges connected to this node
    setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.source !== id && edge.target !== id)
    );

    // Clear selection if needed
    if (sourceNodeId === id) setSourceNodeId(null);
    if (destinationNodeId === id) setDestinationNodeId(null);

    // Clear result if it includes this node
    if (result && result.path.includes(id)) {
      setResult(null);
    }
  };

  // Handle adding an edge
  const handleEdgeAdd = (edge: BusRoute) => {
    setEdges((prevEdges) => [...prevEdges, edge]);
  };

  // Handle deleting an edge
  const handleEdgeDelete = (id: string) => {
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== id));

    // Clear result if it might be affected
    if (result) {
      const deletedEdge = edges.find((edge) => edge.id === id);
      if (
        deletedEdge &&
        result.path.includes(deletedEdge.source) &&
        result.path.includes(deletedEdge.target)
      ) {
        setResult(null);
      }
    }
  };

  // Calculate the optimal route
  const calculateRoute = async () => {
    if (!sourceNodeId || !destinationNodeId) {
      toast.error("Please select source and destination nodes");
      return;
    }

    setIsCalculating(true);
    setResult(null);

    try {
      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Run Dijkstra's algorithm
      const dijkstraResult = dijkstra(
        nodes,
        edges,
        sourceNodeId,
        destinationNodeId,
        metric
      );

      setResult(dijkstraResult);

      if (dijkstraResult.noPathFound) {
        toast.error("No path found", {
          description: "There is no valid route between the selected stops.",
        });
      } else {
        toast.success("Route found", {
          description: `The optimal ${metric} path has been calculated.`,
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Error calculating route", {
        description:
          "An unexpected error occurred while finding the best route.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Reset the graph
  const resetGraph = () => {
    setNodes([]);
    setEdges([]);
    setSourceNodeId(null);
    setDestinationNodeId(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {/* Main Graph Canvas */}
        <div className="md:col-span-3 h-[calc(100vh-8rem)] bg-card rounded-lg shadow-sm overflow-hidden">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onNodeAdd={handleNodeAdd}
            onNodeMove={handleNodeMove}
            onNodeDelete={handleNodeDelete}
            onEdgeAdd={handleEdgeAdd}
            onEdgeDelete={handleEdgeDelete}
            sourceNodeId={sourceNodeId}
            destinationNodeId={destinationNodeId}
            setSourceNodeId={setSourceNodeId}
            setDestinationNodeId={setDestinationNodeId}
            result={result}
            isCalculating={isCalculating}
            metric={metric}
          />
        </div>

        {/* Control & Results Panel */}
        <div className="md:col-span-1 flex flex-col space-y-4">
          <ControlPanel
            nodes={nodes}
            sourceNodeId={sourceNodeId}
            destinationNodeId={destinationNodeId}
            onCalculateRoute={calculateRoute}
            onResetGraph={resetGraph}
            isCalculating={isCalculating}
            metric={metric}
            setMetric={setMetric}
            hasResult={!!result}
            noPathFound={!!result?.noPathFound}
          />

          <ResultsPanel
            result={result}
            nodes={nodes}
            edges={edges}
            metric={metric}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
