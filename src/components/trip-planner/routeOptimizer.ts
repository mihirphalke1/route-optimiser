interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export class RouteOptimizer {
  public distanceMatrix: Map<string, Map<string, number>>;
  private pathMatrix: Map<string, Map<string, [number, number][]>>;
  private locations: Location[];

  constructor() {
    this.distanceMatrix = new Map();
    this.pathMatrix = new Map();
    this.locations = [];
  }

  async buildGraph(locations: Location[]): Promise<void> {
    this.locations = [...locations];
    this.distanceMatrix.clear();
    this.pathMatrix.clear();

    // Calculate distances and paths between all pairs of locations
    for (let i = 0; i < locations.length; i++) {
      const from = locations[i];
      const fromDistances = new Map<string, number>();
      const fromPaths = new Map<string, [number, number][]>();

      for (let j = 0; j < locations.length; j++) {
        if (i === j) continue;

        const to = locations[j];
        const { distance, path } = await this.calculateRoute(from, to);

        fromDistances.set(to.id, distance);
        fromPaths.set(to.id, path);
      }

      this.distanceMatrix.set(from.id, fromDistances);
      this.pathMatrix.set(from.id, fromPaths);
    }
  }

  private async calculateRoute(
    from: Location,
    to: Location
  ): Promise<{ distance: number; path: [number, number][] }> {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        return {
          distance: route.distance,
          path: route.geometry.coordinates.map((coord: [number, number]) => [
            coord[1],
            coord[0],
          ]),
        };
      }
      throw new Error("No route found");
    } catch (error) {
      console.error("Error calculating route:", error);
      // Fallback to straight-line distance if API fails
      const distance = this.haversineDistance(from, to);
      return {
        distance,
        path: [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
      };
    }
  }

  private haversineDistance(from: Location, to: Location): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(to.lat - from.lat);
    const dLon = this.toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) *
        Math.cos(this.toRad(to.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  findOptimalRoute(startId: string): {
    path: [number, number][];
    totalDistance: number;
    orderedLocations: Location[];
  } {
    if (this.locations.length <= 1) {
      return { path: [], totalDistance: 0, orderedLocations: [] };
    }

    const startLocation = this.locations.find((loc) => loc.id === startId);
    if (!startLocation) {
      throw new Error("Start location not found");
    }

    // For small numbers of locations, use the nearest neighbor algorithm with 2-opt improvement
    if (this.locations.length <= 10) {
      return this.nearestNeighborWithTwoOpt(startId);
    } else {
      // Fall back to simpler nearest neighbor for larger sets
      return this.nearestNeighbor(startId);
    }
  }

  private nearestNeighbor(startId: string): {
    path: [number, number][];
    totalDistance: number;
    orderedLocations: Location[];
  } {
    const unvisited = new Set(this.locations.map((loc) => loc.id));
    unvisited.delete(startId);

    let currentId = startId;
    let totalDistance = 0;
    const route: string[] = [startId];

    // Find the nearest unvisited neighbor
    while (unvisited.size > 0) {
      const currentDistances = this.distanceMatrix.get(currentId);
      if (!currentDistances) break;

      let nextId = "";
      let minDistance = Infinity;

      unvisited.forEach((id) => {
        const distance = currentDistances.get(id);
        if (distance !== undefined && distance < minDistance) {
          minDistance = distance;
          nextId = id;
        }
      });

      if (nextId === "") break;

      unvisited.delete(nextId);
      route.push(nextId);
      totalDistance += minDistance;
      currentId = nextId;
    }

    // Return to start (TSP)
    if (route.length > 1) {
      const lastId = route[route.length - 1];
      const lastToStartDistance =
        this.distanceMatrix.get(lastId)?.get(startId) || 0;
      totalDistance += lastToStartDistance;
    }

    return this.constructRouteResult(route);
  }

  private nearestNeighborWithTwoOpt(startId: string): {
    path: [number, number][];
    totalDistance: number;
    orderedLocations: Location[];
  } {
    // Start with nearest neighbor solution
    const nnSolution = this.nearestNeighbor(startId);
    const route = nnSolution.orderedLocations.map((loc) => loc.id);

    // Apply 2-opt improvement
    let improvement = true;
    let bestDistance = nnSolution.totalDistance;

    while (improvement) {
      improvement = false;

      for (let i = 1; i < route.length - 1; i++) {
        for (let j = i + 1; j < route.length; j++) {
          // Skip adjacent edges
          if (j === i + 1) continue;

          // Calculate current segment distances
          const d1 = this.distanceMatrix.get(route[i - 1])?.get(route[i]) || 0;
          const d2 = this.distanceMatrix.get(route[j - 1])?.get(route[j]) || 0;

          // Calculate new segment distances if we swap
          const d3 =
            this.distanceMatrix.get(route[i - 1])?.get(route[j - 1]) || 0;
          const d4 = this.distanceMatrix.get(route[i])?.get(route[j]) || 0;

          // Check if swap improves total distance
          if (d1 + d2 > d3 + d4) {
            // Reverse the segment from i to j-1
            this.reverseSegment(route, i, j - 1);

            // Calculate new total distance
            const newDistance = this.calculateRouteDistance(route);

            if (newDistance < bestDistance) {
              bestDistance = newDistance;
              improvement = true;
            } else {
              // Undo the swap if it didn't improve
              this.reverseSegment(route, i, j - 1);
            }
          }
        }
      }
    }

    return this.constructRouteResult(route);
  }

  private reverseSegment(route: string[], start: number, end: number): void {
    while (start < end) {
      [route[start], route[end]] = [route[end], route[start]];
      start++;
      end--;
    }
  }

  private calculateRouteDistance(route: string[]): number {
    let totalDistance = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      totalDistance += this.distanceMatrix.get(from)?.get(to) || 0;
    }

    // Add distance back to start for TSP
    if (route.length > 1) {
      const lastId = route[route.length - 1];
      const firstId = route[0];
      totalDistance += this.distanceMatrix.get(lastId)?.get(firstId) || 0;
    }

    return totalDistance;
  }

  private constructRouteResult(route: string[]): {
    path: [number, number][];
    totalDistance: number;
    orderedLocations: Location[];
  } {
    const path: [number, number][] = [];
    let totalDistance = 0;
    const orderedLocations: Location[] = [];

    // Construct the path from the route segments
    for (let i = 0; i < route.length - 1; i++) {
      const fromId = route[i];
      const toId = route[i + 1];

      const fromLocation = this.locations.find((loc) => loc.id === fromId);
      if (fromLocation) {
        // Create a copy with updated order
        orderedLocations.push({
          ...fromLocation,
          order: orderedLocations.length + 1,
        });
      }

      const segmentPath = this.pathMatrix.get(fromId)?.get(toId) || [];
      path.push(...segmentPath);

      totalDistance += this.distanceMatrix.get(fromId)?.get(toId) || 0;
    }

    // Add the last location
    const lastId = route[route.length - 1];
    const lastLocation = this.locations.find((loc) => loc.id === lastId);
    if (lastLocation) {
      orderedLocations.push({
        ...lastLocation,
        order: orderedLocations.length + 1,
      });
    }

    // Return to start (for TSP)
    if (route.length > 1) {
      const firstId = route[0];
      const returnPath = this.pathMatrix.get(lastId)?.get(firstId) || [];
      path.push(...returnPath);

      // Add return distance
      totalDistance += this.distanceMatrix.get(lastId)?.get(firstId) || 0;
    }

    return { path, totalDistance, orderedLocations };
  }
}
