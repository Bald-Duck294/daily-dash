"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const Select = SelectPrimitive.Root;

const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
        "bg-[var(--report-input-bg)] text-[var(--report-input-text)]",
        "border-[var(--report-input-border)]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-lg border shadow-md",
          "bg-[var(--report-surface)] text-[var(--foreground)]",
          "border-[var(--report-border)]",
          "w-[var(--radix-select-trigger-width)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm",
        "focus:bg-[var(--muted)] focus:text-[var(--foreground)]",
        "data-[state=checked]:bg-[var(--primary)] data-[state=checked]:text-[var(--primary-foreground)]",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = "SelectItem";

const SelectValue = SelectPrimitive.Value;

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};
