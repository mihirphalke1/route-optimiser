import { useEffect, useRef, useState } from "react";
import {
  Edge,
  NodePoint,
  DijkstraResult,
  MetricType,
  Position,
} from "@/types/graph";
import { delay } from "@/utils/dijkstra";
import { toast } from "sonner";

interface GraphCanvasProps {
  nodes: NodePoint[];
  edges: Edge[];
  onNodeAdd: (node: NodePoint) => void;
  onNodeMove: (id: string, position: Position) => void;
  onNodeDelete: (id: string) => void;
  onEdgeAdd: (edge: Edge) => void;
  onEdgeDelete: (id: string) => void;
  sourceNodeId: string | null;
  destinationNodeId: string | null;
  setSourceNodeId: (id: string | null) => void;
  setDestinationNodeId: (id: string | null) => void;
  result: DijkstraResult | null;
  isCalculating: boolean;
  metric: MetricType;
  isAddingNode?: boolean;
}

const NODE_RADIUS = 20;
const ANIMATION_SPEED = 500; // ms per step

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  onNodeAdd,
  onNodeMove,
  onNodeDelete,
  onEdgeAdd,
  onEdgeDelete,
  sourceNodeId,
  destinationNodeId,
  setSourceNodeId,
  setDestinationNodeId,
  result,
  isCalculating,
  metric,
  isAddingNode = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState("0 0 800 600");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [visualSteps, setVisualSteps] = useState<number>(-1);
  const [showCosts, setShowCosts] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Animation state
  const [animationInProgress, setAnimationInProgress] = useState(false);

  // Handle window resize
  useEffect(() => {
    const updateViewBox = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setViewBox(`0 0 ${width} ${height}`);
        setCanvasSize({ width, height });
      }
    };

    updateViewBox();
    window.addEventListener("resize", updateViewBox);

    return () => {
      window.removeEventListener("resize", updateViewBox);
    };
  }, []);

  // Animate algorithm steps when result changes
  useEffect(() => {
    if (!result || !result.steps || result.steps.length === 0) return;

    const animateAlgorithm = async () => {
      setAnimationInProgress(true);
      setVisualSteps(-1);

      // Allow a brief pause before starting animation
      await delay(300);

      // Animate each step with a consistent delay
      for (let i = 0; i < result.steps.length; i++) {
        setVisualSteps(i);
        await delay(ANIMATION_SPEED);
      }

      // Keep the final state visible
      setAnimationInProgress(false);
    };

    // Start animation
    animateAlgorithm();

    // Cleanup function to reset animation if component unmounts during animation
    return () => {
      setAnimationInProgress(false);
      setVisualSteps(-1);
    };
  }, [result]);

  // Update the animationInProgress state when isCalculating changes
  useEffect(() => {
    if (isCalculating) {
      // Stop any ongoing animation when starting a new calculation
      setAnimationInProgress(false);
      setVisualSteps(-1);
    }
  }, [isCalculating]);

  // Update the animation state when nodes or edges change
  useEffect(() => {
    // Reset visualization if the graph structure changes
    if (
      result &&
      (nodes.length !== result.nodes.length ||
        edges.length !== result.edges.length)
    ) {
      setVisualSteps(-1);
      setAnimationInProgress(false);
    }
  }, [nodes.length, edges.length, result]);

  // Get SVG coordinates from mouse event
  const getSvgCoordinates = (e: React.MouseEvent): Position => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const svgRect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top,
    };
  };

  // Handle canvas click for adding nodes
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging || connectingFrom) return;

    // Only add nodes if in adding mode and clicking on the canvas background
    if (!isAddingNode && e.target === e.currentTarget) return;

    // If in adding mode and clicking on the background, add a new node
    const position = getSvgCoordinates(e);

    // Check if we're clicking on an existing node
    const clickedOnNode = nodes.some((node) => {
      const dx = node.position.x - position.x;
      const dy = node.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    });

    // Only proceed if we're clicking on the canvas background (not on another element) and not on an existing node
    if (isAddingNode && e.target === e.currentTarget && !clickedOnNode) {
      const newNodeId = `node-${Date.now()}`;
      onNodeAdd({
        id: newNodeId,
        label: `Node ${nodes.length + 1}`,
        position,
      });

      toast("Node added successfully", {
        description: "Click and drag to move it or double-click to delete.",
      });
    }
  };

  // Handle node selection
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    if (connectingFrom) {
      // Creating a connection between nodes
      if (connectingFrom !== nodeId) {
        // Check if edge already exists
        const edgeExists = edges.some(
          (edge) =>
            (edge.source === connectingFrom && edge.target === nodeId) ||
            (edge.source === nodeId && edge.target === connectingFrom)
        );

        if (!edgeExists) {
          // Get the nodes
          const sourceNode = nodes.find((node) => node.id === connectingFrom);
          const targetNode = nodes.find((node) => node.id === nodeId);

          if (sourceNode && targetNode) {
            // Generate a random cost between 1 and 10
            const cost = Math.round((Math.random() * 9 + 1) * 10) / 10;

            onEdgeAdd({
              id: `edge-${Date.now()}`,
              source: connectingFrom,
              target: nodeId,
              cost: cost,
              time: Math.round(cost * 5) / 10,
              distance: Math.round(cost * 8) / 10,
            });

            toast("Connection added", {
              description: "A new edge between nodes has been created.",
            });
          }
        } else {
          toast("Connection already exists", {
            description: "These nodes are already connected.",
          });
        }
      }
      setConnectingFrom(null);
      return;
    }

    if (e.shiftKey) {
      // Set as source node
      setSourceNodeId(nodeId === sourceNodeId ? null : nodeId);
      return;
    }

    if (e.altKey) {
      // Set as destination node
      setDestinationNodeId(nodeId === destinationNodeId ? null : nodeId);
      return;
    }

    // Normal selection
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
  };

  // Handle node deletion
  const handleNodeDoubleClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    onNodeDelete(nodeId);
    setSelectedNodeId(null);

    if (sourceNodeId === nodeId) setSourceNodeId(null);
    if (destinationNodeId === nodeId) setDestinationNodeId(null);

    toast("Node deleted", {
      description: "The node and all its connections have been removed.",
    });
  };

  // Handle edge deletion
  const handleEdgeDoubleClick = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    onEdgeDelete(edgeId);
    toast("Connection deleted", {
      description: "The edge between nodes has been removed.",
    });
  };

  // Handle node drag start
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setIsDragging(true);
    setDragStartPos(getSvgCoordinates(e));
  };

  // Handle node dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedNodeId && dragStartPos) {
      const currentPos = getSvgCoordinates(e);
      const node = nodes.find((n) => n.id === selectedNodeId);

      if (node) {
        const newPosition = {
          x: node.position.x + (currentPos.x - dragStartPos.x),
          y: node.position.y + (currentPos.y - dragStartPos.y),
        };

        onNodeMove(selectedNodeId, newPosition);
        setDragStartPos(currentPos);
      }
    }
  };

  // Handle node drag end
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartPos(null);
    }
  };

  // Start connecting nodes
  const handleStartConnecting = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
    toast("Creating connection", {
      description: "Click on another node to create an edge between them.",
    });
  };

  // Calculate edge path
  const getEdgePath = (source: NodePoint, target: NodePoint): string => {
    const dx = target.position.x - source.position.x;
    const dy = target.position.y - source.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate points on the edge of the nodes
    const sourceX = source.position.x + (dx / distance) * NODE_RADIUS;
    const sourceY = source.position.y + (dy / distance) * NODE_RADIUS;
    const targetX = target.position.x - (dx / distance) * NODE_RADIUS;
    const targetY = target.position.y - (dy / distance) * NODE_RADIUS;

    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  };

  // Calculate edge label position
  const getEdgeLabelPosition = (source: NodePoint, target: NodePoint) => {
    return {
      x: (source.position.x + target.position.x) / 2,
      y: (source.position.y + target.position.y) / 2 - 10,
    };
  };

  // Check if an edge is in the current path
  const isEdgeInPath = (edge: Edge): boolean => {
    if (
      !result ||
      !result.steps ||
      result.steps.length === 0 ||
      visualSteps === -1
    ) {
      return false;
    }

    const currentStep =
      result.steps[Math.min(visualSteps, result.steps.length - 1)];
    const path = currentStep.path || [];

    for (let i = 0; i < path.length - 1; i++) {
      const fromId = path[i];
      const toId = path[i + 1];

      if (
        (edge.source === fromId && edge.target === toId) ||
        (edge.source === toId && edge.target === fromId)
      ) {
        return true;
      }
    }

    return false;
  };

  // Check if a node is in visited nodes
  const isNodeVisited = (nodeId: string): boolean => {
    if (!result || !result.steps || visualSteps === -1) return false;

    // Get current step or the last step if visualization is complete
    const step = result.steps[Math.min(visualSteps, result.steps.length - 1)];
    return step.visitedNodes.includes(nodeId);
  };

  // Check if a node is the current node being processed
  const isCurrentNode = (nodeId: string): boolean => {
    if (!result || !result.steps || visualSteps === -1) return false;

    // Get current step or the last step if visualization is complete
    const step = result.steps[Math.min(visualSteps, result.steps.length - 1)];
    return step.currentNode === nodeId;
  };

  // Get node CSS classes based on its state
  const getNodeClasses = (node: NodePoint) => {
    const classes = ["node"];

    if (node.id === selectedNodeId) classes.push("node-selected");
    if (node.id === sourceNodeId) classes.push("node-source");
    if (node.id === destinationNodeId) classes.push("node-destination");
    if (isCurrentNode(node.id)) classes.push("node-current");
    if (isNodeVisited(node.id)) classes.push("node-visited");

    return classes.join(" ");
  };

  // Get edge CSS classes based on its state
  const getEdgeClasses = (edge: Edge) => {
    const classes = ["edge"];

    if (isEdgeInPath(edge)) {
      classes.push("edge-active");
      classes.push("animate-pulse"); // Pulsing animation for the active path
    } else if (
      visualSteps !== -1 &&
      (isNodeVisited(edge.source) || isNodeVisited(edge.target))
    ) {
      classes.push("edge-visited");
    }

    return classes.join(" ");
  };

  // Get node fill color based on its state
  const getNodeFill = (node: NodePoint) => {
    if (node.id === sourceNodeId) return "hsl(var(--accent))";
    if (node.id === destinationNodeId) return "hsl(var(--secondary))";
    if (isCurrentNode(node.id)) return "hsl(var(--warning))"; // More distinct color for current node
    if (isNodeVisited(node.id)) return "hsl(var(--accent) / 0.7)";
    return "hsl(var(--primary))";
  };

  // Get distance label for a node
  const getDistanceLabel = (nodeId: string) => {
    if (!result || visualSteps === -1) return "";

    const currentStep = result.steps[visualSteps];
    const distance = currentStep.distances[nodeId];

    if (distance === Infinity) return "∞";
    return distance.toFixed(1);
  };

  // Toggle cost labels
  const toggleCostLabels = () => {
    setShowCosts(!showCosts);
  };

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full shadow-sm hover:bg-accent/80 transition-colors"
          onClick={toggleCostLabels}
        >
          {showCosts ? "Hide Weights" : "Show Weights"}
        </button>
      </div>

      {/* Algorithm step counter */}
      {result && result.steps && result.steps.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-card rounded-md shadow-md p-2 z-10">
          <div className="text-xs font-medium mb-1">
            Algorithm Step: {visualSteps + 1} / {result.steps.length}
          </div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/80"
              onClick={() => setVisualSteps(Math.max(0, visualSteps - 1))}
              disabled={visualSteps <= 0 || animationInProgress}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/80"
              onClick={() => {
                if (animationInProgress) {
                  // Stop animation
                  setAnimationInProgress(false);
                } else {
                  // Start/restart animation
                  const animate = async () => {
                    setAnimationInProgress(true);
                    // Start from current step or beginning
                    const startStep = visualSteps >= 0 ? visualSteps : 0;

                    for (let i = startStep; i < result.steps.length; i++) {
                      setVisualSteps(i);
                      await delay(ANIMATION_SPEED);
                      if (!animationInProgress) break;
                    }

                    setAnimationInProgress(false);
                  };

                  animate();
                }
              }}
            >
              {animationInProgress
                ? "Stop"
                : visualSteps >= result.steps.length - 1
                ? "Restart"
                : "Play"}
            </button>
            <button
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/80"
              onClick={() =>
                setVisualSteps(
                  Math.min(result.steps.length - 1, visualSteps + 1)
                )
              }
              disabled={
                visualSteps >= result.steps.length - 1 || animationInProgress
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {connectingFrom && (
        <div className="absolute top-4 left-4 py-2 px-4 bg-card shadow-md rounded-lg z-10 animate-fade-in">
          <p className="text-sm">Click on another node to connect</p>
          <button
            onClick={() => setConnectingFrom(null)}
            className="text-xs text-primary hover:underline mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges */}
        {edges.map((edge) => {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);

          if (!source || !target) return null;

          const path = getEdgePath(source, target);
          const labelPos = getEdgeLabelPosition(source, target);
          const edgeValue = edge[metric] || edge.cost;

          return (
            <g
              key={edge.id}
              onDoubleClick={(e) => handleEdgeDoubleClick(e, edge.id)}
            >
              <path
                d={path}
                strokeWidth={2}
                stroke="hsl(var(--muted-foreground) / 0.5)"
                className={getEdgeClasses(edge)}
              />
              {showCosts && (
                <g
                  transform={`translate(${labelPos.x}, ${labelPos.y})`}
                  className="cursor-pointer"
                >
                  <rect
                    x="-15"
                    y="-12"
                    width="30"
                    height="16"
                    rx="4"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--card-foreground))"
                    fontSize="10"
                  >
                    {edgeValue.toFixed(1)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            className={getNodeClasses(node)}
            onClick={(e) => handleNodeClick(e, node.id)}
            onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)}
            onMouseDown={(e) => handleNodeDragStart(e, node.id)}
            style={{
              cursor:
                isDragging && selectedNodeId === node.id
                  ? "grabbing"
                  : "pointer",
            }}
          >
            {/* Node Circle */}
            <circle
              r={NODE_RADIUS}
              fill={getNodeFill(node)}
              className="transition-all duration-300"
            />

            {/* Node Label */}
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              {node.label}
            </text>

            {/* Distance Label (if algorithm is running) */}
            {visualSteps !== -1 && (
              <text
                y={-NODE_RADIUS - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--foreground))"
                fontSize="10"
                fontWeight="bold"
                className="animate-fade-in"
              >
                {getDistanceLabel(node.id)}
              </text>
            )}

            {/* Connect button */}
            {selectedNodeId === node.id &&
              !animationInProgress &&
              !connectingFrom && (
                <g
                  transform={`translate(${NODE_RADIUS + 5}, 0)`}
                  className="animate-pop-in"
                  onClick={(e) => handleStartConnecting(e, node.id)}
                >
                  <circle
                    r="10"
                    fill="hsl(var(--primary))"
                    className="cursor-pointer hover:brightness-110 transition-all"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                  >
                    +
                  </text>
                </g>
              )}
          </g>
        ))}
      </svg>

      {/* Instructions overlay for empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <div className="max-w-md p-6 bg-card rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Getting Started</h3>
            <p className="mb-3">
              Click the '+' button in the bottom right and then click anywhere
              on the canvas to add nodes.
            </p>
            <p className="mb-3">
              Connect nodes by selecting one and clicking the + button that
              appears next to it.
            </p>
            <p className="mb-3">Hold Shift and click to set a starting node.</p>
            <p className="mb-3">
              Hold Alt and click to set a destination node.
            </p>
            <p className="mb-3">
              Run Dijkstra's algorithm to find the shortest path between nodes.
            </p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => {
                const demoNodes = [
                  {
                    id: "node-1",
                    label: "Node 1",
                    position: { x: 200, y: 200 },
                  },
                  {
                    id: "node-2",
                    label: "Node 2",
                    position: { x: 400, y: 150 },
                  },
                  {
                    id: "node-3",
                    label: "Node 3",
                    position: { x: 600, y: 200 },
                  },
                  {
                    id: "node-4",
                    label: "Node 4",
                    position: { x: 300, y: 350 },
                  },
                  {
                    id: "node-5",
                    label: "Node 5",
                    position: { x: 500, y: 350 },
                  },
                ];

                const demoEdges = [
                  {
                    id: "edge-1",
                    source: "node-1",
                    target: "node-2",
                    cost: 5.0,
                    time: 2.5,
                    distance: 4.0,
                  },
                  {
                    id: "edge-2",
                    source: "node-2",
                    target: "node-3",
                    cost: 7.0,
                    time: 3.5,
                    distance: 5.6,
                  },
                  {
                    id: "edge-3",
                    source: "node-1",
                    target: "node-4",
                    cost: 4.5,
                    time: 2.3,
                    distance: 3.6,
                  },
                  {
                    id: "edge-4",
                    source: "node-4",
                    target: "node-5",
                    cost: 6.2,
                    time: 3.1,
                    distance: 5.0,
                  },
                  {
                    id: "edge-5",
                    source: "node-2",
                    target: "node-5",
                    cost: 8.5,
                    time: 4.3,
                    distance: 6.8,
                  },
                  {
                    id: "edge-6",
                    source: "node-3",
                    target: "node-5",
                    cost: 6.8,
                    time: 3.4,
                    distance: 5.4,
                  },
                ];

                demoNodes.forEach((node) => onNodeAdd(node));
                setTimeout(() => {
                  demoEdges.forEach((edge) => onEdgeAdd(edge));
                }, 500);

                setSourceNodeId("node-1");
                setDestinationNodeId("node-3");

                toast("Demo graph loaded", {
                  description:
                    "Now you can run the algorithm to find the shortest path!",
                });
              }}
            >
              Load Demo Graph
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
