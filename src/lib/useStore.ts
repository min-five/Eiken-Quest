import { useSyncExternalStore } from "react";
import type { AppState } from "../types";
import { Store, getRevision, subscribe } from "./store";

/**
 * Re-renders the component whenever the persisted store is saved.
 * The state object itself is intentionally mutated in place, so read it
 * through this hook instead of relying on reference equality.
 */
export function useStore(): AppState {
  useSyncExternalStore(subscribe, getRevision, getRevision);
  return Store.state;
}
