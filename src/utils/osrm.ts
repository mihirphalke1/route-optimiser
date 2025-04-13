import {
  Location,
  RouteStop,
  RouteSegment,
  OptimizedRoute,
} from "@/types/route";

const OSRM_API_URL = "https://router.project-osrm.org/route/v1/driving";

export const getDistanceMatrix = async (
  stops: RouteStop[]
): Promise<number[][]> => {
  const coordinates = stops
    .map((stop) => `${stop.location.longitude},${stop.location.latitude}`)
    .join(";");

  const response = await fetch(
    `${OSRM_API_URL}/${coordinates}?annotations=distance,duration`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch distance matrix");
  }

  const data = await response.json();
  return data.distances;
};

export const optimizeRoute = async (
  stops: RouteStop[]
): Promise<OptimizedRoute> => {
  const distanceMatrix = await getDistanceMatrix(stops);

  // Implement nearest neighbor algorithm for route optimization
  const visited = new Set<number>();
  const route: RouteStop[] = [];
  let currentIndex = 0;

  // Start with the first stop
  route.push(stops[0]);
  visited.add(0);

  while (visited.size < stops.length) {
    let minDistance = Infinity;
    let nextIndex = -1;

    for (let i = 0; i < stops.length; i++) {
      if (!visited.has(i) && distanceMatrix[currentIndex][i] < minDistance) {
        minDistance = distanceMatrix[currentIndex][i];
        nextIndex = i;
      }
    }

    if (nextIndex === -1) break;

    route.push(stops[nextIndex]);
    visited.add(nextIndex);
    currentIndex = nextIndex;
  }

  // Calculate segments and total distance/duration
  const segments: RouteSegment[] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];
    const distance = distanceMatrix[i][i + 1];
    const duration = distance / 50; // Assuming average speed of 50 km/h

    segments.push({ from, to, distance, duration });
    totalDistance += distance;
    totalDuration += duration;
  }

  return {
    stops: route,
    segments,
    totalDistance,
    totalDuration,
  };
};
