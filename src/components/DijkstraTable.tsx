import { NodePoint, DijkstraResult } from "@/types/graph";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DijkstraTableProps {
  nodes: NodePoint[];
  result: DijkstraResult | null;
  currentStep: number;
  onClose: () => void;
}

const DijkstraTable: React.FC<DijkstraTableProps> = ({
  nodes,
  result,
  currentStep,
  onClose,
}) => {
  const [minimized, setMinimized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [tableSide, setTableSide] = useState<"left" | "right">("left");

  // Auto-minimize the table if the step is first or last
  useEffect(() => {
    if (
      result &&
      result.steps &&
      (currentStep === 0 || currentStep === result.steps.length - 1)
    ) {
      setMinimized(false);
    }
  }, [currentStep, result]);

  if (!result || !result.steps || result.steps.length === 0) {
    return null;
  }

  const step = result.steps[Math.min(currentStep, result.steps.length - 1)];

  // Extract current state from the algorithm step
  const { visitedNodes, distances, currentNode, path } = step;

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / result.steps.length) * 100;

  // Sort nodes by status and then by distance
  const sortedNodes = [...nodes].sort((a, b) => {
    // Current node first
    if (a.id === currentNode && b.id !== currentNode) return -1;
    if (a.id !== currentNode && b.id === currentNode) return 1;

    // Then nodes in the current path
    const aInPath = path.includes(a.id);
    const bInPath = path.includes(b.id);
    if (aInPath && !bInPath) return -1;
    if (!aInPath && bInPath) return 1;

    // Then visited nodes
    const aVisited = visitedNodes.includes(a.id);
    const bVisited = visitedNodes.includes(b.id);
    if (aVisited && !bVisited) return -1;
    if (!aVisited && bVisited) return 1;

    // Then by distance (Infinity nodes last)
    const aDist = distances[a.id] ?? Infinity;
    const bDist = distances[b.id] ?? Infinity;
    if (aDist === Infinity && bDist !== Infinity) return 1;
    if (aDist !== Infinity && bDist === Infinity) return -1;
    return aDist - bDist;
  });

  // Find the source and destination nodes
  const sourceNodeId = result.path.length > 0 ? result.path[0] : null;
  const destinationNodeId =
    result.path.length > 0 ? result.path[result.path.length - 1] : null;

  // Get node display name (use label instead of ID)
  const getNodeName = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.label : nodeId;
  };

  // Toggle table side (left or right)
  const toggleSide = () => {
    setTableSide(tableSide === "left" ? "right" : "left");
  };

  return (
    <div
      className={cn(
        "absolute bottom-20 bg-background border rounded-lg shadow-lg z-30 w-96 max-h-[75vh] flex flex-col overflow-hidden",
        tableSide === "left" ? "left-4" : "right-4"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Dijkstra's Algorithm Steps</h3>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-muted-foreground hover:text-foreground"
            title="How to read this table"
          >
            <HelpCircle size={16} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSide}
            className="p-1 hover:bg-accent rounded-md"
            title="Move table to the other side"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 hover:bg-accent rounded-md"
            title={minimized ? "Expand" : "Minimize"}
          >
            {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Step counter with progress bar */}
      <div className="px-3 py-2 bg-muted/30 border-b text-xs">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {result.steps.length}
            {currentNode && ` — Processing ${getNodeName(currentNode)}`}
          </span>
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className="text-xs text-muted-foreground hover:text-foreground"
            title="Toggle animation effects"
          >
            {showAnimation ? "Hide Effects" : "Show Effects"}
          </button>
        </div>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full bg-primary transition-all duration-300",
              showAnimation ? "transition-all" : ""
            )}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Help text */}
          {showHelp && (
            <div className="p-3 text-xs border-b bg-muted/20">
              <p className="mb-1 font-medium">
                Understanding Dijkstra's Algorithm:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <span className="font-medium">Node:</span> The identifier for
                  each point in the graph
                </li>
                <li>
                  <span className="font-medium">Distance:</span> Shortest known
                  distance from the source node (∞ means not yet calculated)
                </li>
                <li>
                  <span className="font-medium">Status:</span> Current = being
                  processed now, Visited = already processed, Unvisited = not
                  processed yet
                </li>
                <li>
                  <span className="font-medium">Previous:</span> Previous node
                  in the shortest path from source
                </li>
              </ul>
              <p className="mt-2 text-muted-foreground italic">
                The algorithm works by finding the unvisited node with smallest
                distance, processing all its neighbors, then marking it as
                visited.
              </p>
            </div>
          )}

          {/* Result summary if available */}
          {result.noPathFound && (
            <div className="p-3 text-xs border-b bg-red-50 flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <span>
                No path found between the source and destination nodes.
              </span>
            </div>
          )}

          {/* Iteration summary */}
          <div className="p-3 text-xs border-b bg-primary/5">
            <div className="font-medium mb-1 flex items-center justify-between">
              <span>Current Iteration:</span>
              <span className="text-primary">
                {currentStep + 1} of {result.steps.length}
              </span>
            </div>
            <p className="text-muted-foreground mb-2">
              {currentNode ? (
                <>
                  Analyzing node{" "}
                  <span className="font-medium text-foreground">
                    {getNodeName(currentNode)}
                  </span>
                </>
              ) : (
                "Initialization phase"
              )}
            </p>

            {/* Step explanation - what's happening now */}
            <div className="bg-card p-2.5 rounded border text-foreground mb-2">
              <p className="font-medium mb-1">What's happening in this step:</p>
              {currentStep === 0 ? (
                <p>
                  The algorithm is initializing. The source node (
                  {getNodeName(sourceNodeId || "")}) has a distance of 0, and
                  all other nodes have infinite distance.
                </p>
              ) : currentNode ? (
                <p>
                  The algorithm has selected {getNodeName(currentNode)}{" "}
                  (distance: {distances[currentNode].toFixed(1)}) as the node
                  with the smallest distance that hasn't been visited yet. Now
                  it's checking all neighbors to see if we can find shorter
                  paths through this node.
                </p>
              ) : (
                <p>
                  The algorithm has computed all possible shortest paths.
                  {result.path.length > 1 ? (
                    <>
                      {" "}
                      The shortest path from {getNodeName(
                        sourceNodeId || ""
                      )}{" "}
                      to {getNodeName(destinationNodeId || "")}
                      is {result.path
                        .map((id) => getNodeName(id))
                        .join(" → ")}{" "}
                      with a total distance of {result.distance.toFixed(1)}.
                    </>
                  ) : result.noPathFound ? (
                    <>
                      {" "}
                      There is no path from {getNodeName(
                        sourceNodeId || ""
                      )} to {getNodeName(destinationNodeId || "")}.
                    </>
                  ) : (
                    <>
                      {" "}
                      The final distances from {getNodeName(
                        sourceNodeId || ""
                      )}{" "}
                      to all other nodes have been calculated.
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-2xs">
              <div>
                <span className="font-medium">Processed Nodes:</span>{" "}
                <span>
                  {visitedNodes.length === 0
                    ? "None"
                    : visitedNodes.map((id) => getNodeName(id)).join(", ")}
                </span>
              </div>
              <div>
                <span className="font-medium">Current Path:</span>{" "}
                <span>
                  {path.length <= 1
                    ? "No path yet"
                    : path.map((id) => getNodeName(id)).join(" → ")}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="px-3 py-1.5 text-left font-medium">Node</th>
                  <th className="px-3 py-1.5 text-left font-medium">
                    Distance
                  </th>
                  <th className="px-3 py-1.5 text-left font-medium">Status</th>
                  <th className="px-3 py-1.5 text-left font-medium">
                    Previous
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedNodes.map((node) => {
                  const isCurrentNode = node.id === currentNode;
                  const isVisited = visitedNodes.includes(node.id);
                  const isInPath = path.includes(node.id);
                  const isSource = node.id === sourceNodeId;
                  const isDestination = node.id === destinationNodeId;
                  const distance = distances[node.id] ?? Infinity;

                  // Find previous node in the path if available
                  let previousNode = null;
                  if (path) {
                    const nodeIndex = path.indexOf(node.id);
                    if (nodeIndex > 0) {
                      previousNode = path[nodeIndex - 1];
                    }
                  }

                  return (
                    <tr
                      key={node.id}
                      className={cn(
                        "hover:bg-accent/10",
                        isCurrentNode && "bg-primary/10",
                        isInPath && !isCurrentNode && "bg-green-50",
                        showAnimation && isCurrentNode && "animate-pulse"
                      )}
                    >
                      <td className="px-3 py-1.5 flex items-center gap-1">
                        <span
                          className={cn(
                            "font-medium",
                            isSource && "text-blue-600",
                            isDestination && "text-purple-600"
                          )}
                        >
                          {node.label}
                        </span>
                        {isSource && (
                          <span className="text-2xs text-blue-600">
                            (Start)
                          </span>
                        )}
                        {isDestination && (
                          <span className="text-2xs text-purple-600">
                            (End)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        <span
                          className={cn(
                            distance === Infinity ? "opacity-60" : "",
                            distance !== Infinity && "font-medium"
                          )}
                        >
                          {distance === Infinity ? "∞" : distance.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        <span
                          className={cn(
                            "inline-block px-1.5 rounded-full text-2xs",
                            isCurrentNode && "bg-primary/20 text-primary",
                            isVisited &&
                              !isCurrentNode &&
                              "bg-green-100 text-green-800",
                            !isVisited &&
                              !isCurrentNode &&
                              "bg-yellow-100 text-yellow-800",
                            isInPath &&
                              !isCurrentNode &&
                              "ring-1 ring-green-400"
                          )}
                        >
                          {isCurrentNode
                            ? "Current"
                            : isVisited
                            ? "Visited"
                            : "Unvisited"}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        {previousNode ? (
                          <span
                            className={
                              isInPath ? "font-medium text-green-700" : ""
                            }
                          >
                            {getNodeName(previousNode)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Educational content */}
          <div className="p-3 text-xs border-t bg-muted/20">
            <p className="font-medium mb-2">How Dijkstra's Algorithm Works:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-muted-foreground">
              <li
                className={cn(currentStep === 0 && "text-primary font-medium")}
              >
                <span className="font-medium text-foreground">Initialize:</span>{" "}
                Set distance to source node as 0 and all other nodes as infinity
              </li>
              <li
                className={cn(
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1 &&
                    "text-primary font-medium"
                )}
              >
                <span className="font-medium text-foreground">Select:</span>{" "}
                Choose unvisited node with smallest known distance
              </li>
              <li
                className={cn(
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1 &&
                    "text-primary font-medium"
                )}
              >
                <span className="font-medium text-foreground">Process:</span>{" "}
                For each neighbor, calculate distance through current node
              </li>
              <li
                className={cn(
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1 &&
                    "text-primary font-medium"
                )}
              >
                <span className="font-medium text-foreground">Update:</span> If
                new path is shorter, update the distance
              </li>
              <li
                className={cn(
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1 &&
                    "text-primary font-medium"
                )}
              >
                <span className="font-medium text-foreground">Mark:</span> Set
                current node as visited and repeat until all nodes visited
              </li>
            </ol>

            {/* Pseudo-code section */}
            <div
              className="mt-3 bg-black rounded p-2.5 text-gray-300 font-mono text-2xs overflow-auto"
              style={{ maxHeight: "150px" }}
            >
              <p className="text-gray-500">
                // Dijkstra's Algorithm Pseudocode
              </p>
              <p className={currentStep === 0 ? "text-yellow-400" : ""}>
                function dijkstra(graph, source):
              </p>
              <p className="pl-4 text-gray-500">// Initialize</p>
              <p
                className={cn(
                  "pl-4",
                  currentStep === 0 ? "text-yellow-400" : ""
                )}
              >
                dist[source] = 0
              </p>
              <p
                className={cn(
                  "pl-4",
                  currentStep === 0 ? "text-yellow-400" : ""
                )}
              >
                for each vertex v in graph:
              </p>
              <p
                className={cn(
                  "pl-8",
                  currentStep === 0 ? "text-yellow-400" : ""
                )}
              >
                if v ≠ source: dist[v] = infinity
              </p>
              <p
                className={cn(
                  "pl-8",
                  currentStep === 0 ? "text-yellow-400" : ""
                )}
              >
                previous[v] = undefined
              </p>
              <p
                className={cn(
                  "pl-4",
                  currentStep === 0 ? "text-yellow-400" : ""
                )}
              >
                unvisited = all nodes in graph
              </p>
              <p>&nbsp;</p>
              <p className="pl-4 text-gray-500">// Find shortest path</p>
              <p
                className={cn(
                  "pl-4",
                  currentStep > 0 && currentStep < result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                while unvisited is not empty:
              </p>
              <p
                className={cn(
                  "pl-8",
                  currentNode && currentStep > 0 ? "text-yellow-400" : ""
                )}
              >
                u = vertex in unvisited with smallest distance
              </p>
              <p
                className={cn(
                  "pl-8",
                  currentNode && visitedNodes.includes(currentNode)
                    ? "text-yellow-400"
                    : ""
                )}
              >
                remove u from unvisited
              </p>
              <p>&nbsp;</p>
              <p
                className={cn(
                  "pl-8",
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                for each neighbor v of u:
              </p>
              <p
                className={cn(
                  "pl-12",
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                alt = dist[u] + length(u, v)
              </p>
              <p
                className={cn(
                  "pl-12",
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                if alt &lt; dist[v]:
              </p>
              <p
                className={cn(
                  "pl-16",
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                dist[v] = alt
              </p>
              <p
                className={cn(
                  "pl-16",
                  currentNode &&
                    currentStep > 0 &&
                    currentStep < result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                previous[v] = u
              </p>
              <p>&nbsp;</p>
              <p
                className={cn(
                  "pl-4",
                  currentStep === result.steps.length - 1
                    ? "text-yellow-400"
                    : ""
                )}
              >
                return dist[], previous[]
              </p>
            </div>

            <div className="mt-3 bg-primary/5 p-2 rounded text-primary-foreground border border-primary/10">
              <p className="text-xs font-medium">Current Algorithm State:</p>
              <p className="text-xs mt-1">
                {currentNode ? (
                  <>
                    Processing node{" "}
                    <span className="font-medium">
                      {getNodeName(currentNode)}
                    </span>
                  </>
                ) : (
                  "Awaiting next step"
                )}
                {result && result.path.length > 0 && (
                  <>
                    . Found path cost:{" "}
                    <span className="font-medium">
                      {result.distance.toFixed(1)}
                    </span>
                  </>
                )}
                {result && result.noPathFound && (
                  <span className="text-red-500">
                    {" "}
                    No valid path exists between source and destination.
                  </span>
                )}
              </p>
              {currentNode && visitedNodes.length > 0 && (
                <p className="text-xs mt-1 text-muted-foreground">
                  Already visited:{" "}
                  {visitedNodes
                    .filter((id) => id !== currentNode)
                    .map((id) => getNodeName(id))
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DijkstraTable;
