import { useState } from "react";
import Navbar from "@/components/Navbar";
import GraphCanvas from "@/components/GraphCanvas";
import ControlPanel from "@/components/ControlPanel";
import ResultsPanel from "@/components/ResultsPanel";
import {
  Edge,
  NodePoint,
  DijkstraResult,
  MetricType,
  Position,
} from "@/types/graph";
import { dijkstra } from "@/utils/dijkstra";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AlgorithmVisualizer = () => {
  // Graph state
  const [nodes, setNodes] = useState<NodePoint[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Selection state
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [destinationNodeId, setDestinationNodeId] = useState<string | null>(
    null
  );

  // Algorithm state
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<DijkstraResult | null>(null);
  const [metric, setMetric] = useState<MetricType>("cost");
  const [isAddingNode, setIsAddingNode] = useState(false);

  // Handle adding a node
  const handleNodeAdd = (node: NodePoint) => {
    console.log("Adding node:", node);
    setNodes((prevNodes) => [...prevNodes, node]);
    // Keep add mode enabled to allow adding multiple nodes
  };

  // Handle moving a node
  const handleNodeMove = (id: string, position: Position) => {
    console.log(`Moving node ${id} to position:`, position);
    
    // Properly update the node's position without creating duplicates
    setNodes((prevNodes) => {
      return prevNodes.map((node) => 
        node.id === id ? { ...node, position } : node
      );
    });
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
  const handleEdgeAdd = (edge: Edge) => {
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
          description: "There is no valid route between the selected nodes.",
        });
      } else {
        toast.success("Path found", {
          description: `The optimal ${metric} path has been calculated.`,
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Error calculating path", {
        description:
          "An unexpected error occurred while finding the best path.",
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

  // Toggle node adding mode
  const toggleAddingNode = () => {
    const newValue = !isAddingNode;
    console.log("Toggling add node mode:", { current: isAddingNode, new: newValue });
    setIsAddingNode(newValue);
    
    if (newValue) {
      toast.info("Add Node Mode", {
        description: "Click anywhere on the canvas to add a new node.",
      });
    } else {
      toast.info("Add Node Mode Disabled", {
        description: "You've exited node adding mode.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto py-4">
        <h1 className="text-2xl font-bold">Dijkstra's Algorithm Visualizer</h1>
        <p className="text-muted-foreground">
          Create nodes, add connections with weights, and visualize how
          Dijkstra's algorithm finds the shortest path
        </p>

        <div className="flex items-center mt-2 gap-3">
          <Button
            onClick={toggleAddingNode}
            variant={isAddingNode ? "default" : "outline"}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAddingNode ? "Adding Nodes (Click to Disable)" : "Add Nodes"}
          </Button>

          {isAddingNode && (
            <p className="text-sm text-muted-foreground">
              Click anywhere on the canvas below to add nodes
            </p>
          )}
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4 container mx-auto">
        {/* Main Graph Canvas */}
        <div className="md:col-span-3 h-[calc(100vh-12rem)] bg-card rounded-lg shadow-sm overflow-hidden relative">
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
            isAddingNode={isAddingNode}
            toggleAddingNode={toggleAddingNode}
          />

          {/* Floating Add Node Button */}
          <Button
            className="absolute bottom-4 right-4 rounded-full shadow-lg h-12 w-12 p-0 z-20"
            variant={isAddingNode ? "default" : "secondary"}
            onClick={toggleAddingNode}
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          {/* Mode indicator */}
          {isAddingNode && (
            <div className="absolute bottom-20 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-md z-20 animate-pulse">
              Click on canvas to add nodes
            </div>
          )}
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

export default AlgorithmVisualizer;
