import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  const scrollToHashOrTop = () => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useLayoutEffect(scrollToHashOrTop, [pathname, hash]);

  useEffect(scrollToHashOrTop, [pathname, hash]);

  return null;
};

export default ScrollToTop;
