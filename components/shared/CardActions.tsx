'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Componente único e centralizado para ações de edição e remoção em cards.
 */

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  variant?: 'floating' | 'inline' | 'small';
};

export function CardActions({ onEdit, onDelete, className, variant = 'floating' }: Props) {
  // Define o estilo baseado na variante escolhida
  const containerCls = variant === 'floating' 
    ? "absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
    : "flex gap-2";

  const iconSize = variant === 'small' ? 12 : 14;
  const paddingCls = variant === 'small' ? "p-1.5" : "p-2";
  const roundedCls = variant === 'small' ? "rounded-lg" : "rounded-xl";

  const btnBase = cn(
    "shadow-lg transition-all active:scale-95 flex items-center justify-center",
    paddingCls,
    roundedCls
  );

  return (
    <div className={cn(containerCls, className)}>
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className={cn(btnBase, "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20")}
        title="Editar"
      >
        <Pencil size={iconSize} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={cn(btnBase, "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/20")}
        title="Remover"
      >
        <Trash2 size={iconSize} />
      </button>
    </div>
  );
}
