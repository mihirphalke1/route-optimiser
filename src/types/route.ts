export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteStop {
  id: string;
  location: Location;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface RouteSegment {
  from: RouteStop;
  to: RouteStop;
  distance: number;
  duration: number;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
}
