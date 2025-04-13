import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteStop, OptimizedRoute } from "@/types/route";
import { optimizeRoute } from "@/utils/osrm";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().optional(),
});

const formSchema = z.object({
  stops: z.array(locationSchema),
  sameStartEnd: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export const RouteOptimizer = () => {
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);

      const stops: RouteStop[] = data.stops.map((stop, index) => ({
        id: `stop-${index}`,
        location: stop,
        isStart: index === 0,
        isEnd: data.sameStartEnd && index === data.stops.length - 1,
      }));

      const result = await optimizeRoute(stops);
      setOptimizedRoute(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Route Optimizer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Stops</label>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      {...register(`stops.${index}.name`)}
                      placeholder="Location name"
                    />
                    <Input
                      {...register(`stops.${index}.latitude`, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      placeholder="Latitude"
                      step="0.000001"
                    />
                    <Input
                      {...register(`stops.${index}.longitude`, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      placeholder="Longitude"
                      step="0.000001"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("sameStartEnd")}
                className="h-4 w-4"
              />
              <label className="text-sm">Same start and end point</label>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" disabled={loading}>
              {loading ? "Optimizing..." : "Optimize Route"}
            </Button>
          </form>

          {optimizedRoute && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Optimized Route</h3>
              <div className="mt-2">
                <p>
                  Total Distance:{" "}
                  {(optimizedRoute.totalDistance / 1000).toFixed(2)} km
                </p>
                <p>
                  Total Duration:{" "}
                  {(optimizedRoute.totalDuration / 60).toFixed(2)} hours
                </p>
                <div className="mt-2">
                  <h4 className="font-medium">Route:</h4>
                  <ol className="list-decimal pl-4">
                    {optimizedRoute.stops.map((stop, index) => (
                      <li key={stop.id}>
                        {stop.location.name || `Stop ${index + 1}`}
                        {stop.isStart && " (Start)"}
                        {stop.isEnd && " (End)"}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
