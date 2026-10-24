import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ModalAction {
  label: string;
  kind?: "primary" | "danger" | "ghost" | "outline";
  onClick?: (close: () => void) => void;
}

interface ModalProps {
  title: string;
  children: ReactNode;
  actions?: ModalAction[];
  wide?: boolean;
  dismissible?: boolean;
  onClose: () => void;
  className?: string;
}

function actionClass(kind?: ModalAction["kind"]): string {
  if (kind === "primary") return "btn btn--primary";
  if (kind === "danger") return "btn btn--danger";
  if (kind === "ghost") return "btn btn--ghost";
  return "btn btn--outline";
}

export function Modal({ title, children, actions = [], wide, dismissible = true, onClose, className }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusables = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => {
      if (!cardRef.current) return;
      const target =
        cardRef.current.querySelector<HTMLElement>(".modal__body input, .modal__body button, .modal__body select, .modal__body textarea") ||
        cardRef.current.querySelector<HTMLElement>("[data-close]");
      target?.focus();
    }, 30);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (prevFocus && prevFocus.focus) {
        try {
          prevFocus.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [dismissible]);

  const host = document.getElementById("modal-root") || document.body;
  const close = () => {
    if (dismissible) onClose();
  };

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title || "ダイアログ"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={`modal__card ${wide ? "modal__card--wide" : ""} ${className || ""}`} ref={cardRef}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button className="icon-btn" type="button" data-close aria-label="閉じる" onClick={close}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {actions.length > 0 && (
          <div className="modal__foot">
            {actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                type="button"
                className={actionClass(action.kind)}
                data-act={index}
                onClick={() => {
                  if (action.onClick) action.onClick(close);
                  else close();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    host,
  );
}
