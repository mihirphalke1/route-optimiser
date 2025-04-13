
// Node and edge types for our graph visualization

export interface Position {
  x: number;
  y: number;
}

export interface BusStop {
  id: string;
  label: string;
  position: Position;
  metadata?: {
    lat?: number;
    lon?: number;
    realWorld?: boolean;
    address?: string;
  };
}

export interface BusRoute {
  id: string;
  source: string;
  target: string;
  cost: number;
  time?: number;
  distance?: number;
}

export interface GraphData {
  nodes: BusStop[];
  edges: BusRoute[];
}

export type MetricType = 'cost' | 'time' | 'distance';

export interface DijkstraStep {
  currentNode: string;
  visitedNodes: string[];
  distances: Record<string, number>;
  previousNodes: Record<string, string | null>;
  shortestPath?: string[];
}

export interface DijkstraResult {
  path: string[];
  distance: number;
  steps: DijkstraStep[];
  noPathFound?: boolean;
}
