import type { CSSProperties, ReactNode } from "react";
import { EQ_GRADE_MAP } from "../data/vocabulary";
import { gradeOf } from "../lib/format";

interface RingProps {
  pct: number;
  value: ReactNode;
  label?: string;
  className?: string;
}

export function Ring({ pct, value, label, className }: RingProps) {
  return (
    <div
      className={`ring ${className || ""}`}
      style={{ "--p": Math.max(0, Math.min(100, pct)) } as CSSProperties}
    >
      <div className="ring__inner">
        <span className="ring__value">{value}</span>
        {label ? <span className="ring__label">{label}</span> : null}
      </div>
    </div>
  );
}

export function Progress({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={`progress ${className || ""}`}>
      <span className="progress__bar" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function GradeBadge({ id, extra }: { id: string; extra?: string }) {
  const g = EQ_GRADE_MAP[id as keyof typeof EQ_GRADE_MAP] ?? gradeOf(id);
  if (!g) return null;
  return (
    <span className="grade-badge" style={{ "--g": g.color } as CSSProperties}>
      {g.full}
      {extra ? ` ${extra}` : ""}
    </span>
  );
}

interface StarsProps {
  rating: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function Stars({ rating, max = 5, onChange }: StarsProps) {
  return (
    <div className="stars" data-rating={rating}>
      {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
        <button
          key={i}
          type="button"
          data-star={i}
          className={i <= rating ? "is-on" : ""}
          aria-label={`${i}点`}
          onClick={() => onChange?.(i)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
