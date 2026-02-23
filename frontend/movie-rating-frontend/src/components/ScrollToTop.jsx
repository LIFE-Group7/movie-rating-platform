import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window back to the top on every route change.
 * Mounted once inside the router so it runs globally without
 * any individual page needing to manage scroll position itself.
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
