import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook that scrolls to the top of the page when the location changes
 */
export const useScrollTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]); // Re-run the effect when the pathname changes
};
