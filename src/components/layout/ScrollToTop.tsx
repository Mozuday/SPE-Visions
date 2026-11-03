import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/*
 * Scroll to the top on page changes, but leave #anchor links
 * (like #courses) alone so they can scroll to their section.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;

    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;