"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = "580px" }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-vb-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-vb-panel border border-vb-border rounded-xl max-h-[80vh] overflow-y-auto p-8 animate-fade-in"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="font-display text-[28px] tracking-[1px]">{title}</h2>
          <button
            onClick={onClose}
            className="bg-none border-none text-vb-muted text-[22px] cursor-pointer px-1 hover:text-vb-text transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
