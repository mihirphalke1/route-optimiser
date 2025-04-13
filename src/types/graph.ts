// Node and edge types for our graph visualization

export interface Position {
  x: number;
  y: number;
}

export type MetricType = "cost" | "time" | "distance";

export interface NodePoint {
  id: string;
  label: string;
  position: Position;
  metadata?: {
    lat?: number;
    lon?: number;
    realWorld?: boolean;
    [key: string]: any;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  cost: number;
  time: number;
  distance: number;
}

export interface GraphData {
  nodes: NodePoint[];
  edges: Edge[];
}

export interface DijkstraStep {
  currentNode: string;
  visitedNodes: string[];
  distances: Record<string, number>;
  path: string[];
}

export interface DijkstraResult {
  nodes: NodePoint[];
  edges: Edge[];
  path: string[];
  steps: DijkstraStep[];
  distance: number;
  noPathFound: boolean;
}
