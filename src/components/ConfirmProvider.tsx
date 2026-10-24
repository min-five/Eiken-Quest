import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Modal } from "./Modal";

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

let confirmImpl: ConfirmFn | null = null;

/** Promise-based confirm that can be used from any component or helper. */
export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  if (!confirmImpl) return Promise.resolve(window.confirm(options.message || options.title || "よろしいですか？"));
  return confirmImpl(options);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    setDialog(null);
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(value);
  }, []);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setDialog(options);
    });
  }, []);

  confirmImpl = confirm;

  return (
    <>
      {children}
      {dialog && (
        <Modal
          title={dialog.title || "確認"}
          onClose={() => settle(false)}
          actions={[
            {
              label: dialog.cancelLabel || "キャンセル",
              kind: "ghost",
              onClick: () => settle(false),
            },
            {
              label: dialog.confirmLabel || "OK",
              kind: dialog.danger ? "danger" : "primary",
              onClick: () => settle(true),
            },
          ]}
        >
          <p style={{ fontSize: ".9rem", lineHeight: 1.8, margin: 0 }}>{dialog.message}</p>
        </Modal>
      )}
    </>
  );
}
