'use client';

import { cn } from "@/lib/utils";
import React from "react";

const inputCls = "w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-400";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(inputCls, className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';