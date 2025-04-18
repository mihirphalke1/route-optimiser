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
  toggleAddingNode?: () => void;
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
  toggleAddingNode,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState("0 0 800 600");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isConnectingDrag, setIsConnectingDrag] = useState(false);
  const [connectingLine, setConnectingLine] = useState<{start: Position, end: Position} | null>(null);
  const [visualSteps, setVisualSteps] = useState<number>(-1);
  const [showCosts, setShowCosts] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [dragCooldown, setDragCooldown] = useState(false);
  
  // Keep track of the last dragged node to avoid visual duplicates
  const [lastDraggedNode, setLastDraggedNode] = useState<string | null>(null);

  // New state for the connection mode and weight dialog
  const [isConnectingMode, setIsConnectingMode] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [pendingConnection, setPendingConnection] = useState<{source: string, target: string} | null>(null);

  // New state for the node selection mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [nodeSelectionMenu, setNodeSelectionMenu] = useState<{nodeId: string, position: Position} | null>(null);

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
    console.log("SVG dimensions:", {
      left: svgRect.left,
      top: svgRect.top,
      clientX: e.clientX,
      clientY: e.clientY
    });
    
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    return { x, y };
  };

  // Handle canvas click for adding nodes
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement | SVGRectElement>) => {
    console.log("Canvas clicked:", { 
      isAddingNode, 
      isDragging,
      dragCooldown,
      connectingFrom,
      target: e.target.tagName,
      currentTarget: e.currentTarget.tagName
    });
    
    // Don't add nodes if we're dragging, in cooldown, or connecting nodes
    if (isDragging || dragCooldown || connectingFrom) {
      console.log("Ignoring click - dragging, cooldown or connecting");
      return;
    }
    
    // Only add nodes if in adding mode
    if (!isAddingNode) {
      console.log("Not in adding mode - ignoring click");
      return;
    }
    
    // IMPORTANT: Don't check e.target === e.currentTarget
    // Get click coordinates regardless of what was clicked
    const position = getSvgCoordinates(e);
    console.log("Processing click for adding node at position:", position);
    
    // Check if we're clicking on an existing node
    const clickedOnNode = nodes.some((node) => {
      const dx = node.position.x - position.x;
      const dy = node.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
    });
    
    if (clickedOnNode) {
      console.log("Click too close to existing node - ignoring");
      return;
    }
    
    // Create a new node
    const newNodeId = `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const newNode = {
      id: newNodeId,
      label: `Node ${nodes.length + 1}`,
      position,
    };
    
    console.log("Creating new node:", newNode);
    onNodeAdd(newNode);
    
    toast.success("Node added", {
      description: "Click and drag to move it or double-click to delete.",
    });
    
    // Show a hint for connecting nodes if this is the second node or more
    if (nodes.length >= 1) {
      setTimeout(() => {
        toast.info("Connect nodes with Ctrl+Drag", {
          description: "Hold Ctrl (or Cmd) key and drag from one node to another to connect them.",
        });
      }, 1500);
    }
  };

  // Toggle connection mode
  const toggleConnectionMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't allow connection mode when adding nodes
    if (isAddingNode) return;
    
    const newValue = !isConnectingMode;
    setIsConnectingMode(newValue);
    
    // Clear any selected nodes when toggling
    setSelectedNodeId(null);
    setConnectingFrom(null);
    
    // Exit select mode when entering connect mode
    if (newValue) {
      setIsSelectMode(false);
      setNodeSelectionMenu(null);
      toast.info("Connect Nodes Mode", {
        description: "Click on a node to start a connection, then click on another node to connect them.",
      });
    } else {
      toast.info("Connect Mode Disabled", {
        description: "You've exited connection mode.",
      });
    }
  };

  // Toggle node selection mode
  const toggleSelectMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't allow select mode when adding nodes
    if (isAddingNode) return;
    
    const newValue = !isSelectMode;
    setIsSelectMode(newValue);
    
    // Exit connect mode when entering select mode
    if (newValue) {
      setIsConnectingMode(false);
      setConnectingFrom(null);
      toast.info("Start/End Selection Mode", {
        description: "Click on a node to set it as start or destination.",
      });
    } else {
      setNodeSelectionMenu(null);
      toast.info("Selection Mode Disabled", {
        description: "You've exited start/end selection mode.",
      });
    }
  };

  // Handle node selection in connection mode
  const handleConnectionModeNodeClick = (nodeId: string) => {
    if (!connectingFrom) {
      // First node selection
      setConnectingFrom(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setConnectingLine({
          start: node.position,
          end: node.position
        });
      }
      toast.info("First node selected", {
        description: "Now click on another node to create a connection.",
      });
    } else if (connectingFrom !== nodeId) {
      // Second node selection - open weight dialog
      setPendingConnection({
        source: connectingFrom,
        target: nodeId
      });
      setWeightDialogOpen(true);
    }
  };

  // Complete connection with the provided weight
  const completeConnection = () => {
    if (!pendingConnection) return;
    
    // Check if edge already exists
    const edgeExists = edges.some(
      (edge) =>
        (edge.source === pendingConnection.source && edge.target === pendingConnection.target) ||
        (edge.source === pendingConnection.target && edge.target === pendingConnection.source)
    );

    if (!edgeExists) {
      // Create the new edge with the user-specified weight
      onEdgeAdd({
        id: `edge-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        source: pendingConnection.source,
        target: pendingConnection.target,
        cost: edgeWeight,
        // Calculate time and distance based on the weight, maintaining the same proportions
        time: Math.round(edgeWeight * 5) / 10,
        distance: Math.round(edgeWeight * 8) / 10,
      });
      
      toast.success("Connection added", {
        description: `Edge created with weight: ${edgeWeight}`,
      });
    } else {
      toast.error("Connection already exists", {
        description: "These nodes are already connected.",
      });
    }
    
    // Reset the connection state
    setConnectingFrom(null);
    setConnectingLine(null);
    setPendingConnection(null);
    setWeightDialogOpen(false);
    setEdgeWeight(1);
  };
  
  // Cancel the pending connection
  const cancelConnection = () => {
    setConnectingFrom(null);
    setConnectingLine(null);
    setPendingConnection(null);
    setWeightDialogOpen(false);
    setEdgeWeight(1);
  };

  // Handle node selection in selection mode
  const handleSelectionModeNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Show the selection menu
    setNodeSelectionMenu({
      nodeId,
      position: node.position
    });
  };
  
  // Set node as start
  const setNodeAsStart = (nodeId: string) => {
    setSourceNodeId(nodeId === sourceNodeId ? null : nodeId);
    setNodeSelectionMenu(null);
    toast.success("Start node set", {
      description: `Node ${nodes.find(n => n.id === nodeId)?.label || nodeId} is now the start node.`
    });
  };
  
  // Set node as destination
  const setNodeAsDestination = (nodeId: string) => {
    setDestinationNodeId(nodeId === destinationNodeId ? null : nodeId);
    setNodeSelectionMenu(null);
    toast.success("Destination node set", {
      description: `Node ${nodes.find(n => n.id === nodeId)?.label || nodeId} is now the destination node.`
    });
  };
  
  // Close the node selection menu
  const closeNodeSelectionMenu = () => {
    setNodeSelectionMenu(null);
  };

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    // If in selection mode, handle accordingly
    if (isSelectMode) {
      handleSelectionModeNodeClick(e, nodeId);
      return;
    }

    // If in connecting mode, handle accordingly
    if (isConnectingMode) {
      handleConnectionModeNodeClick(nodeId);
      return;
    }

    if (connectingFrom) {
      // Creating a connection between nodes using the old method
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
              id: `edge-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
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

  // Before returning the component JSX 
  // Check for duplicate nodes that might cause the issue
  const nodeIds = new Set();
  const duplicateIds = new Set();
  
  // Filter out duplicates before rendering
  const uniqueNodes = nodes.filter(node => {
    if (nodeIds.has(node.id)) {
      duplicateIds.add(node.id);
      return false; // Skip this node, it's a duplicate
    } else {
      nodeIds.add(node.id);
      return true; // Keep this node
    }
  });
  
  if (duplicateIds.size > 0) {
    console.error("DUPLICATE NODE IDS DETECTED:", Array.from(duplicateIds));
  }
  
  // Handle node drag start 
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    console.log(`Starting drag for node: ${nodeId}`);
    
    e.stopPropagation();
    e.preventDefault(); // Prevent any other handlers from firing
    
    // Start connection dragging if holding Ctrl key
    if (e.ctrlKey || e.metaKey) {
      console.log("Starting connection drag from node:", nodeId);
      setConnectingFrom(nodeId);
      setIsConnectingDrag(true);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setConnectingLine({
          start: node.position,
          end: node.position
        });
      }
      return;
    }
    
    // Regular node dragging
    setSelectedNodeId(nodeId);
    setIsDragging(true);
    setLastDraggedNode(nodeId); // Track which node is being dragged
    setDragStartPos(getSvgCoordinates(e));
    
    // Log current nodes state for debugging
    console.log(`Node drag start - Current nodes:`, nodes.map(n => n.id));
  };

  // Handle node dragging and connection line drawing
  const handleMouseMove = (e: React.MouseEvent) => {
    const currentPos = getSvgCoordinates(e);
    
    // Case 1: Dragging a node to move it
    if (isDragging && selectedNodeId && dragStartPos) {
      // Log to debug what node is being dragged
      console.log(`Dragging node: ${selectedNodeId}`);
      
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (!node) {
        console.error(`Node with ID ${selectedNodeId} not found during drag`);
        return;
      }

      const newPosition = {
        x: node.position.x + (currentPos.x - dragStartPos.x),
        y: node.position.y + (currentPos.y - dragStartPos.y),
      };

      // Call the parent component's onNodeMove function
      onNodeMove(selectedNodeId, newPosition);
      setDragStartPos(currentPos);
      
      // Prevent any default behavior or event bubbling
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Case 2: Dragging to create a connection
    if (isConnectingDrag && connectingFrom) {
      const sourceNode = nodes.find(n => n.id === connectingFrom);
      if (sourceNode) {
        setConnectingLine({
          start: sourceNode.position,
          end: currentPos
        });
      }
    }
  };

  // Handle mouse up - potentially creating connections
  const handleMouseUp = (e: React.MouseEvent) => {
    // For regular node dragging
    if (isDragging) {
      // Prevent any subsequent click events
      e.stopPropagation();
      setIsDragging(false);
      setDragStartPos(null);
      
      // Reset last dragged node after a delay to allow rendering to complete
      setTimeout(() => {
        setLastDraggedNode(null);
      }, 50);
      
      // Set cooldown flag to prevent node creation right after dragging
      setDragCooldown(true);
      // Reset cooldown after a short delay
      setTimeout(() => {
        setDragCooldown(false);
        console.log("Drag cooldown ended");
      }, 300);
    }
    
    // For connection dragging - check if we're over another node
    if (isConnectingDrag && connectingFrom && connectingLine) {
      const mousePos = getSvgCoordinates(e);
      
      // Find if we released on a node
      const targetNode = nodes.find(node => {
        const dx = node.position.x - mousePos.x;
        const dy = node.position.y - mousePos.y;
        return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS;
      });
      
      // If we found a target node that's not the source node
      if (targetNode && targetNode.id !== connectingFrom) {
        // Check if edge already exists
        const edgeExists = edges.some(
          (edge) =>
            (edge.source === connectingFrom && edge.target === targetNode.id) ||
            (edge.source === targetNode.id && edge.target === connectingFrom)
        );

        if (!edgeExists) {
          // Generate a random cost between 1 and 10
          const cost = Math.round((Math.random() * 9 + 1) * 10) / 10;

          onEdgeAdd({
            id: `edge-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            source: connectingFrom,
            target: targetNode.id,
            cost: cost,
            time: Math.round(cost * 5) / 10,
            distance: Math.round(cost * 8) / 10,
          });

          toast.success("Connection added", {
            description: "A new edge between nodes has been created.",
          });
        } else {
          toast.error("Connection already exists", {
            description: "These nodes are already connected.",
          });
        }
      }
      
      // Reset connection dragging state
      setIsConnectingDrag(false);
      setConnectingFrom(null);
      setConnectingLine(null);
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
    <div 
      className="relative w-full h-full bg-muted rounded-lg overflow-hidden"
      onClick={(e) => {
        // Only process container clicks when in add node mode and not during dragging
        if (!isAddingNode || isDragging) return;
        handleCanvasClick(e);
        
        // Close node selection menu when clicking elsewhere
        if (nodeSelectionMenu) {
          closeNodeSelectionMenu();
        }
      }}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button
          className={`px-3 py-1 ${isSelectMode ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'} text-sm rounded-full shadow-sm hover:bg-accent/80 transition-colors`}
          onClick={toggleSelectMode}
        >
          {isSelectMode ? "Exit Selection Mode" : "Set Start/End"}
        </button>
        <button
          className={`px-3 py-1 ${isConnectingMode ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'} text-sm rounded-full shadow-sm hover:bg-accent/80 transition-colors`}
          onClick={toggleConnectionMode}
        >
          {isConnectingMode ? "Exit Connect Mode" : "Connect Nodes"}
        </button>
        <button
          className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full shadow-sm hover:bg-accent/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from reaching canvas
            toggleCostLabels();
          }}
        >
          {showCosts ? "Hide Weights" : "Show Weights"}
        </button>
      </div>

      {/* Algorithm step counter */}
      {result && result.steps && result.steps.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-card rounded-md shadow-md p-2 z-30">
          <div className="text-xs font-medium mb-1">
            Algorithm Step: {visualSteps + 1} / {result.steps.length}
          </div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/80"
              onClick={(e) => {
                e.stopPropagation();
                setVisualSteps(Math.max(0, visualSteps - 1));
              }}
              disabled={visualSteps <= 0 || animationInProgress}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/80"
              onClick={(e) => {
                e.stopPropagation();
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
              onClick={(e) => {
                e.stopPropagation();
                setVisualSteps(
                  Math.min(result.steps.length - 1, visualSteps + 1)
                );
              }}
              disabled={
                visualSteps >= result.steps.length - 1 || animationInProgress
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Selection mode indicator */}
      {isSelectMode && (
        <div className="absolute top-4 left-4 py-2 px-4 bg-accent text-accent-foreground shadow-md rounded-lg z-30 animate-fade-in">
          <p className="text-sm font-medium">Start/End Selection Mode</p>
          <p className="text-xs mt-1">
            Click on a node to select it as start or destination
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectMode(e);
            }}
            className="text-xs underline hover:text-accent-foreground/80 mt-2"
          >
            Exit
          </button>
        </div>
      )}

      {/* Connection mode indicator */}
      {isConnectingMode && (
        <div className="absolute top-4 left-4 py-2 px-4 bg-primary text-primary-foreground shadow-md rounded-lg z-30 animate-fade-in">
          <p className="text-sm font-medium">Connection Mode</p>
          <p className="text-xs mt-1">
            {connectingFrom 
              ? "Now click on another node to connect to it" 
              : "Click on a node to start a connection"}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleConnectionMode(e);
            }}
            className="text-xs underline hover:text-primary-foreground/80 mt-2"
          >
            Exit
          </button>
        </div>
      )}

      {/* Connecting with old method indicator */}
      {connectingFrom && !isConnectingMode && (
        <div className="absolute top-4 left-4 py-2 px-4 bg-card shadow-md rounded-lg z-30 animate-fade-in">
          <p className="text-sm">Click on another node to connect</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConnectingFrom(null);
            }}
            className="text-xs text-primary hover:underline mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Weight dialog */}
      {weightDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Set Connection Weight</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the weight for this connection. This value represents the edge cost
              (time and distance will be calculated proportionally).
            </p>
            
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-sm font-medium">Weight:</label>
              <input
                type="number"
                value={edgeWeight}
                onChange={(e) => setEdgeWeight(parseFloat(e.target.value) || 0)}
                min="0.1"
                step="0.1"
                className="border rounded-md px-3 py-2 bg-background"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelConnection}
                className="px-4 py-2 rounded-md border hover:bg-accent/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={completeConnection}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node selection popup menu */}
      {nodeSelectionMenu && (
        <div 
          className="absolute z-40"
          style={{
            left: `${nodeSelectionMenu.position.x}px`,
            top: `${nodeSelectionMenu.position.y - 100}px`,
          }}
        >
          <div className="bg-card shadow-lg rounded-lg p-3 flex flex-col gap-2">
            <button
              className="px-3 py-2 bg-accent text-accent-foreground text-sm rounded hover:bg-accent/80 transition-colors flex items-center gap-2"
              onClick={() => setNodeAsStart(nodeSelectionMenu.nodeId)}
            >
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              Set as Start Node
            </button>
            <button
              className="px-3 py-2 bg-secondary text-secondary-foreground text-sm rounded hover:bg-secondary/80 transition-colors flex items-center gap-2"
              onClick={() => setNodeAsDestination(nodeSelectionMenu.nodeId)}
            >
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              Set as Destination
            </button>
            <button
              className="px-3 py-2 text-sm hover:bg-muted transition-colors rounded"
              onClick={closeNodeSelectionMenu}
            >
              Cancel
            </button>
          </div>
          <div 
            className="w-4 h-4 bg-card transform rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2"
            style={{ zIndex: -1 }}
          ></div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className={`w-full h-full ${isAddingNode ? 'cursor-crosshair' : ''}`}
        onClick={(e) => {
          // Only process container clicks when in add node mode and not during dragging
          if (!isAddingNode || isDragging) return;
          handleCanvasClick(e);
          
          // Close node selection menu when clicking elsewhere
          if (nodeSelectionMenu) {
            closeNodeSelectionMenu();
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ pointerEvents: "all" }}
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
        {/* This rect acts as our main click target for adding nodes */}
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#grid)"
          onClick={(e) => {
            // Only process container clicks when in add node mode and not during dragging
            if (!isAddingNode || isDragging) return;
            handleCanvasClick(e);
          }}
          style={{ 
            cursor: isAddingNode ? 'crosshair' : 'default',
            pointerEvents: isAddingNode ? 'all' : 'none'
          }}
        />
        
        {/* Connection line being dragged */}
        {isConnectingDrag && connectingLine && (
          <path
            d={`M ${connectingLine.start.x} ${connectingLine.start.y} L ${connectingLine.end.x} ${connectingLine.end.y}`}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        )}

        {/* Adding mode indicator */}
        {isAddingNode && (
          <rect 
            width="100%" 
            height="100%" 
            fill="hsl(var(--primary) / 0.05)" 
            stroke="hsl(var(--primary) / 0.3)" 
            strokeWidth="4" 
            strokeDasharray="10 5"
          />
        )}

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
        {uniqueNodes.map((node) => {
          return (
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
          );
        })}
      </svg>

      {/* Instructions overlay for empty state */}
      {nodes.length === 0 && !isAddingNode && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
          <div className="max-w-md p-6 bg-card rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Getting Started</h3>
            <p className="mb-3">
              Click the '+' button in the bottom right and then click anywhere
              on the canvas to add nodes.
            </p>
            <p className="mb-3">
              Connect nodes by holding Ctrl/Cmd and dragging from one node to another.
            </p>
            <p className="mb-3">Hold Shift and click to set a starting node.</p>
            <p className="mb-3">
              Hold Alt and click to set a destination node.
            </p>
            <p className="mb-6">
              Run Dijkstra's algorithm to find the shortest path between nodes.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // This is what the "+" button would do - it enables add node mode
                  if (!isAddingNode && toggleAddingNode) {
                    toggleAddingNode();
                  }
                }}
              >
                Create New Graph
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const demoNodes = [
                    {
                      id: `node-demo-1-${Date.now()}`,
                      label: "Node 1",
                      position: { x: 200, y: 200 },
                    },
                    {
                      id: `node-demo-2-${Date.now()}`,
                      label: "Node 2",
                      position: { x: 400, y: 150 },
                    },
                    {
                      id: `node-demo-3-${Date.now()}`,
                      label: "Node 3",
                      position: { x: 600, y: 200 },
                    },
                    {
                      id: `node-demo-4-${Date.now()}`,
                      label: "Node 4",
                      position: { x: 300, y: 350 },
                    },
                    {
                      id: `node-demo-5-${Date.now()}`,
                      label: "Node 5",
                      position: { x: 500, y: 350 },
                    },
                  ];

                  const timestamp = Date.now();
                  const demoEdges = [
                    {
                      id: `edge-demo-1-${timestamp}`,
                      source: demoNodes[0].id,
                      target: demoNodes[1].id,
                      cost: 5.0,
                      time: 2.5,
                      distance: 4.0,
                    },
                    {
                      id: `edge-demo-2-${timestamp}`,
                      source: demoNodes[1].id,
                      target: demoNodes[2].id,
                      cost: 7.0,
                      time: 3.5,
                      distance: 5.6,
                    },
                    {
                      id: `edge-demo-3-${timestamp}`,
                      source: demoNodes[0].id,
                      target: demoNodes[3].id,
                      cost: 4.5,
                      time: 2.3,
                      distance: 3.6,
                    },
                    {
                      id: `edge-demo-4-${timestamp}`,
                      source: demoNodes[3].id,
                      target: demoNodes[4].id,
                      cost: 6.2,
                      time: 3.1,
                      distance: 5.0,
                    },
                    {
                      id: `edge-demo-5-${timestamp}`,
                      source: demoNodes[1].id,
                      target: demoNodes[4].id,
                      cost: 8.5,
                      time: 4.3,
                      distance: 6.8,
                    },
                    {
                      id: `edge-demo-6-${timestamp}`,
                      source: demoNodes[2].id,
                      target: demoNodes[4].id,
                      cost: 6.8,
                      time: 3.4,
                      distance: 5.4,
                    },
                  ];

                  demoNodes.forEach((node) => onNodeAdd(node));
                  setTimeout(() => {
                    demoEdges.forEach((edge) => onEdgeAdd(edge));
                  }, 500);

                  setSourceNodeId(demoNodes[0].id);
                  setDestinationNodeId(demoNodes[2].id);

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
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;
