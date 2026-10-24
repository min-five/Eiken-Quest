import { createContext, useContext } from "react";
import type { QuizConfig } from "../types";

export interface AppApi {
  startQuiz: (config: QuizConfig) => void;
  closeQuiz: () => void;
  openGradePicker: () => void;
}

export const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppContext");
  return ctx;
}
