"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type DialogContextValue = { open: boolean; setOpen: (v: boolean) => void };
const DialogCtx = React.createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return <DialogCtx.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogCtx.Provider>;
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DialogCtx);
  if (!ctx?.open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) ctx.setOpen(false);
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg",
          className,
        )}
      >
        <button
          aria-label="Закрыть"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent"
          onClick={() => ctx.setOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props} />
);

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

export const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
