import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Position } from "@/types/graph";

interface LocationSearchProps {
  onLocationSelect: (location: {
    name: string;
    lat: number;
    lon: number;
    position: Position;
  }) => void;
  canvasSize: { width: number; height: number };
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  canvasSize,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Convert geo coordinates to canvas coordinates
  const geoToCanvasPosition = (lat: number, lon: number): Position => {
    // Simple linear mapping for demonstration
    // In a real app, you'd use a proper geo projection library
    return {
      x: ((lon + 180) / 360) * canvasSize.width,
      y: ((90 - lat) / 180) * canvasSize.height,
    };
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      // Use OpenStreetMap's Nominatim API (free and no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "RouteOptimizer/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data = await response.json();
      setSearchResults(data);

      if (data.length === 0) {
        toast.info("No locations found. Try a different search term.");
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      toast.error("Failed to search locations. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: any) => {
    const position = geoToCanvasPosition(
      parseFloat(location.lat),
      parseFloat(location.lon)
    );

    onLocationSelect({
      name: location.display_name.split(",")[0], // Just get the first part of the name
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      position,
    });

    setSearchResults([]);
    setSearchQuery("");
    toast.success(`Added ${location.display_name.split(",")[0]} to the map`);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchLocations();
            }
          }}
        />
        <Button
          onClick={searchLocations}
          disabled={isSearching}
          variant="outline"
          size="icon"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden max-h-[200px] overflow-y-auto">
          <ul className="divide-y divide-border">
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                className="p-2 hover:bg-muted cursor-pointer"
                onClick={() => handleLocationSelect(result)}
              >
                <div className="font-medium">
                  {result.display_name.split(",")[0]}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {result.display_name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
