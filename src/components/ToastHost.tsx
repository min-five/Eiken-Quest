import { useEffect, useRef, useState } from "react";
import type { ToastItem } from "../types";
import { subscribeToasts } from "../lib/ui";

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());

  useEffect(() => {
    const unsubscribe = subscribeToasts((item) => {
      setItems((prev) => [...prev.slice(-2), item]);
      const timer = window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        timers.current.delete(item.id);
      }, item.duration);
      timers.current.set(item.id, timer);
    });
    const map = timers.current;
    return () => {
      unsubscribe();
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  return (
    <div id="toast-root" className="toast-root" aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <div key={item.id} className={`toast${item.type ? ` toast--${item.type}` : ""}`}>
          <span className="toast__icon">{item.icon}</span>
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}
