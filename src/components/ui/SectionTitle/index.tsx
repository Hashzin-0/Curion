'use client';

import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  color?: string;
}

export function SectionTitle({ children, color = "#3b82f6" }: SectionTitleProps) {
  return (
    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
      <span className="w-3 h-10 rounded-full inline-block shadow-lg" style={{ backgroundColor: color }} />
      {children}
    </h2>
  );
}