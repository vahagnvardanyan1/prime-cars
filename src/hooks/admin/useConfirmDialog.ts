import { useState, useCallback } from "react";

export type UseConfirmDialog<T> = {
  target: T | null;
  isOpen: boolean;
  open: (target: T) => void;
  close: () => void;
};

// Manages the open/close/target-entity dance for a confirmation dialog.
// `close` intentionally does not clear `target` so the dialog body can keep
// rendering the entity name during the close animation.
export const useConfirmDialog = <T,>(): UseConfirmDialog<T> => {
  const [target, setTarget] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((next: T) => {
    setTarget(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { target, isOpen, open, close };
};
