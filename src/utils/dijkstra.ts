
import { BusRoute, BusStop, DijkstraResult, DijkstraStep, MetricType } from "@/types/graph";

// Function to find the shortest path using Dijkstra's algorithm
export function dijkstra(
  nodes: BusStop[],
  edges: BusRoute[],
  startNodeId: string,
  endNodeId: string,
  metric: MetricType = 'cost'
): DijkstraResult {
  // Initialize data structures
  const distances: Record<string, number> = {};
  const previousNodes: Record<string, string | null> = {};
  const visitedNodes: string[] = [];
  const unvisitedNodes: string[] = [];
  const steps: DijkstraStep[] = [];

  // Initialize distances
  for (const node of nodes) {
    if (node.id === startNodeId) {
      distances[node.id] = 0;
    } else {
      distances[node.id] = Infinity;
    }
    previousNodes[node.id] = null;
    unvisitedNodes.push(node.id);
  }

  // Process nodes
  while (unvisitedNodes.length > 0) {
    // Find the unvisited node with the smallest distance
    let currentNodeId = unvisitedNodes.reduce((minNode, node) => {
      if (distances[node] < distances[minNode]) return node;
      return minNode;
    }, unvisitedNodes[0]);

    // If the closest node is our target or has a distance of Infinity, we're done
    if (currentNodeId === endNodeId || distances[currentNodeId] === Infinity) {
      visitedNodes.push(currentNodeId);
      unvisitedNodes.splice(unvisitedNodes.indexOf(currentNodeId), 1);
      
      // Record this step
      steps.push({
        currentNode: currentNodeId,
        visitedNodes: [...visitedNodes],
        distances: { ...distances },
        previousNodes: { ...previousNodes },
      });
      
      break;
    }

    // Add current node to visited and remove from unvisited
    visitedNodes.push(currentNodeId);
    unvisitedNodes.splice(unvisitedNodes.indexOf(currentNodeId), 1);

    // Find all neighbors of the current node
    const neighbors = edges.filter(
      edge => edge.source === currentNodeId || edge.target === currentNodeId
    );

    // For each neighbor, calculate new distance
    for (const edge of neighbors) {
      const neighborId = edge.source === currentNodeId ? edge.target : edge.source;
      
      // Skip if neighbor is already visited
      if (visitedNodes.includes(neighborId)) continue;
      
      // Get the edge cost based on the selected metric
      const edgeCost = edge[metric] || edge.cost;
      
      // Calculate new distance
      const newDistance = distances[currentNodeId] + edgeCost;
      
      // If new distance is smaller, update
      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previousNodes[neighborId] = currentNodeId;
      }
    }

    // Record this step
    steps.push({
      currentNode: currentNodeId,
      visitedNodes: [...visitedNodes],
      distances: { ...distances },
      previousNodes: { ...previousNodes },
    });
  }

  // Build the shortest path
  const path: string[] = [];
  let currentNodeId = endNodeId;

  // If there is no path to the end node
  if (previousNodes[endNodeId] === null && endNodeId !== startNodeId) {
    return {
      path: [],
      distance: Infinity,
      steps,
      noPathFound: true
    };
  }

  // Reconstruct the path
  while (currentNodeId) {
    path.unshift(currentNodeId);
    currentNodeId = previousNodes[currentNodeId] || "";
  }

  // Add the final path to the last step
  if (steps.length > 0) {
    steps[steps.length - 1].shortestPath = path;
  }

  return {
    path,
    distance: distances[endNodeId],
    steps
  };
}

// Add a delay function for animations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
