import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { initWasmDijkstra } from "./utils/wasmDijkstra";
import { RouteOptimizer } from "./components/RouteOptimizer";

const queryClient = new QueryClient();

const App = () => {
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const [wasmError, setWasmError] = useState<string | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        await initWasmDijkstra();
        setWasmLoaded(true);
        console.log("WebAssembly Dijkstra module initialized successfully");
      } catch (error) {
        console.error("Failed to load WebAssembly:", error);
        setWasmError(
          "Failed to load WebAssembly module. Falling back to JavaScript implementation."
        );
      }
    };

    loadWasm();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {wasmError && (
          <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground py-2 px-4 text-center z-50">
            {wasmError}
          </div>
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing wasmLoaded={wasmLoaded} />} />
            <Route path="/app" element={<Index />} />
            <Route path="/route-optimizer" element={<RouteOptimizer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
