import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInMonths, differenceInYears, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseSafeDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length >= 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
  }
  return new Date(dateStr);
};

export function calcDuration(startDate: string, endDate: string | null): string {
  const start = parseSafeDate(startDate);
  const end = endDate ? parseSafeDate(endDate) : new Date();
  const months = differenceInMonths(end, start);
  const years = differenceInYears(end, start);
  if (months < 1) return '1 mês';
  if (years < 1) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  const rem = months - years * 12;
  if (rem === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years}a ${rem}m`;
}

export function formatDateRange(start: string, end: string | null): string {
  const s = format(parseSafeDate(start), 'MMM yyyy', { locale: ptBR });
  const e = end ? format(parseSafeDate(end), 'MMM yyyy', { locale: ptBR }) : 'Atual';
  return `${s} - ${e}`;
}

export type DetectedArea = {
  name: string;
  slug: string;
  icon: string;
  themeColor: string;
};

const AREA_RULES: { keywords: string[]; area: DetectedArea }[] = [
  {
    keywords: ['cozinha', 'cozinheiro', 'chef', 'gastronomia', 'pizz', 'padari', 'restaurante', 'barman'],
    area: { name: 'Gastronomia', slug: 'gastronomia', icon: 'ChefHat', themeColor: '#f97316' },
  },
  {
    keywords: ['programador', 'desenvolved', 'developer', 'software', 'tech', 'ti ', 'dados'],
    area: { name: 'Tecnologia', slug: 'tecnologia', icon: 'Code2', themeColor: '#3b82f6' },
  },
  {
    keywords: ['saúde', 'enfermeiro', 'médico', 'hospital', 'fisiotera', 'nutricion', 'psicolog'],
    area: { name: 'Saúde', slug: 'saude', icon: 'Heart', themeColor: '#10b981' },
  },
  {
    keywords: ['atendente', 'vendedor', 'vendas', 'comercial', 'loja', 'caixa', 'balconista'],
    area: { name: 'Vendas & Atendimento', slug: 'vendas', icon: 'ShoppingBag', themeColor: '#8b5cf6' },
  },
  {
    keywords: ['administrativo', 'auxiliar administrativo', 'financeiro', 'rh', 'secretária'],
    area: { name: 'Administrativo', slug: 'administrativo', icon: 'ClipboardList', themeColor: '#14b8a6' },
  },
];

export function detectAreaFromRole(role: string): DetectedArea {
  const roleLower = ` ${role.toLowerCase()} `;
  for (const rule of AREA_RULES) {
    if (rule.keywords.some(kw => roleLower.includes(kw))) {
      return rule.area;
    }
  }
  const name = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  const slug = role.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40);
  return { name, slug, icon: 'Briefcase', themeColor: '#64748b' };
}
