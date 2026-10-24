import { useEffect, useState } from "react";

/** Tracks whether the viewport is narrower than `breakpoint` px. */
export function useIsNarrow(breakpoint = 860): boolean {
  const [narrow, setNarrow] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${Math.max(0, breakpoint - 1)}px)`);
    const onChange = () => setNarrow(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [breakpoint]);

  return narrow;
}
