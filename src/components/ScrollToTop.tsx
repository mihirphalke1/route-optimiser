import { useScrollTop } from "@/hooks/useScrollTop";

/**
 * Component that uses the useScrollTop hook
 * This can be placed in App.tsx or any wrapper component
 * to ensure all route changes trigger a scroll to top
 */
const ScrollToTop = () => {
  useScrollTop();
  return null; // This component doesn't render anything
};

export default ScrollToTop;
