"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

function ThemeModal({ ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="theme-modal" {...props} />;
}

function ThemeModalTrigger({ ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="theme-modal-trigger" {...props} />;
}

function ThemeModalClose({ ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="theme-modal-close" {...props} />;
}

function ThemeModalContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-blue-100/85 bg-white/95 p-4 shadow-2xl shadow-blue-100/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-black/40",
          className,
        )}
        {...props}
      >
        {children}
        <ThemeModalClose className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-slate-600">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </ThemeModalClose>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function ThemeModalHeader({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("space-y-1.5 pr-8", className)} {...props} />;
}

function ThemeModalTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

function ThemeModalDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-slate-600 dark:text-slate-300", className)}
      {...props}
    />
  );
}

function ThemeModalFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export {
  ThemeModal,
  ThemeModalTrigger,
  ThemeModalContent,
  ThemeModalHeader,
  ThemeModalTitle,
  ThemeModalDescription,
  ThemeModalFooter,
  ThemeModalClose,
};
