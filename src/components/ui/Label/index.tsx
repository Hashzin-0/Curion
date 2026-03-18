'use client';

import { cn } from "@/lib/utils";
import React from "react";

const labelCls = "block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => {
  return (
    <label
      className={cn(labelCls, className)}
      ref={ref}
      {...props}
    />
  );
});

Label.displayName = 'Label';