import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Route, Map, Home, Network, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useScrollTop } from "@/hooks/useScrollTop";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use the scroll-to-top hook
  useScrollTop();

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const menuItemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Route className="h-6 w-6 text-primary" />
          <Link to="/" className="text-lg sm:text-xl font-semibold hover:text-primary transition-colors duration-200">
            Route Optimiser
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                className="gap-2 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </motion.div>
          </Link>
          <Link to="/trip-planner">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={
                  location.pathname === "/trip-planner" ? "default" : "ghost"
                }
                className="gap-2 transition-all duration-200"
              >
                <Map className="h-4 w-4" />
                Trip Planner
              </Button>
            </motion.div>
          </Link>
          <Link to="/visualizer">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={
                  location.pathname === "/visualizer" ||
                  location.pathname === "/app"
                    ? "default"
                    : "ghost"
                }
                className="gap-2 transition-all duration-200"
              >
                <Network className="h-4 w-4" />
                Dijkstra Visualizer
              </Button>
            </motion.div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border/40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <div className="container px-4 py-4 space-y-2">
              <motion.div variants={menuItemVariants}>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={location.pathname === "/" ? "default" : "ghost"}
                    className="w-full justify-start gap-2 transition-all duration-200"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <Link to="/trip-planner" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={
                      location.pathname === "/trip-planner" ? "default" : "ghost"
                    }
                    className="w-full justify-start gap-2 transition-all duration-200"
                  >
                    <Map className="h-4 w-4" />
                    Trip Planner
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <Link to="/visualizer" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={
                      location.pathname === "/visualizer" ||
                      location.pathname === "/app"
                        ? "default"
                        : "ghost"
                    }
                    className="w-full justify-start gap-2 transition-all duration-200"
                  >
                    <Network className="h-4 w-4" />
                    Dijkstra Visualizer
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
