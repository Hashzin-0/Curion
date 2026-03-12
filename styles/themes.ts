export const themes = {
  'auxiliar-cozinha': {
    primary: 'bg-orange-500',
    text: 'text-orange-600',
    border: 'border-orange-200',
    bgLight: 'bg-orange-50',
    icon: 'ChefHat',
    pattern: 'bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] opacity-10',
  },
  'atendente': {
    primary: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-200',
    bgLight: 'bg-blue-50',
    icon: 'MessageSquare',
    pattern: 'bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10',
  },
  'estoquista': {
    primary: 'bg-emerald-500',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    bgLight: 'bg-emerald-50',
    icon: 'Package',
    pattern: 'bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10',
  },
  default: {
    primary: 'bg-slate-800',
    text: 'text-slate-800',
    border: 'border-slate-200',
    bgLight: 'bg-slate-50',
    icon: 'Briefcase',
    pattern: 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-10',
  }
};

export type ThemeKey = keyof typeof themes;

export const getTheme = (slug: string) => {
  return themes[slug as ThemeKey] || themes.default;
};
