import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OptimizedRoute } from "@/types/route";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface RouteMapProps {
  route: OptimizedRoute;
}

export const RouteMap = ({ route }: RouteMapProps) => {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (mapRef.current && route.stops.length > 0) {
      const bounds = L.latLngBounds(
        route.stops.map((stop) => [
          stop.location.latitude,
          stop.location.longitude,
        ])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route]);

  const routeCoordinates = route.stops.map((stop) => [
    stop.location.latitude,
    stop.location.longitude,
  ]);

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        ref={mapRef}
        center={[0, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={3}
          opacity={0.7}
        />
        {route.stops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.location.latitude, stop.location.longitude]}
          >
            <Popup>
              {stop.location.name || `Stop ${index + 1}`}
              {stop.isStart && " (Start)"}
              {stop.isEnd && " (End)"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
