import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

export type DetectedArea = {
  name: string;
  slug: string;
  icon: string;
  themeColor: string;
};

const AREA_RULES: { keywords: string[]; area: DetectedArea }[] = [
  {
    keywords: ['cozinha', 'cozinheiro', 'cozinheira', 'chef', 'gastronomia', 'alimentação', 'food', 'pizz', 'padari', 'confeit', 'lanch', 'hamburgue', 'restaurante', 'copa', 'copeiro', 'garçom', 'garçonete', 'barman', 'bartender', 'sushi', 'culinária'],
    area: { name: 'Gastronomia', slug: 'gastronomia', icon: 'ChefHat', themeColor: 'orange' },
  },
  {
    keywords: ['programador', 'desenvolved', 'developer', 'software', 'tech', 'ti ', ' ti', 'suporte técnico', 'dados', 'analista de sistemas', 'sistemas', 'banco de dados', 'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'cybersegurança', 'infraestrutura', 'rede ', 'computação', 'helpdesk', 'web'],
    area: { name: 'Tecnologia', slug: 'tecnologia', icon: 'Code2', themeColor: 'blue' },
  },
  {
    keywords: ['saúde', 'enfermeiro', 'enfermeira', 'médico', 'médica', 'enfermagem', 'técnico de enferma', 'farmacêut', 'dentist', 'fisiotera', 'nutricion', 'psicolog', 'hospital', 'clínica', 'consultório', 'agente de saúde', 'cuidador', 'cuidadora'],
    area: { name: 'Saúde', slug: 'saude', icon: 'Heart', themeColor: 'green' },
  },
  {
    keywords: ['beleza', 'cabelei', 'manicure', 'pedicure', 'estétic', 'esteticista', 'maquiador', 'maquiadora', 'depilação', 'spa', 'salão', 'barbeir', 'nail', 'sobrancelha'],
    area: { name: 'Beleza & Estética', slug: 'beleza', icon: 'Sparkles', themeColor: 'pink' },
  },
  {
    keywords: ['estoque', 'estoquista', 'logística', 'almoxarife', 'armazém', 'depósito', 'motorista', 'entregador', 'separador', 'conferente', 'transporte', 'repositor', 'operador de empilhadeira'],
    area: { name: 'Logística & Estoque', slug: 'logistica', icon: 'Package', themeColor: 'blue' },
  },
  {
    keywords: ['atendente', 'vendedor', 'vendedora', 'vendas', 'comercial', 'loja', 'caixa', 'balconista', 'promotor', 'promotora', 'representante comercial', 'sac'],
    area: { name: 'Vendas & Atendimento', slug: 'vendas', icon: 'ShoppingBag', themeColor: 'purple' },
  },
  {
    keywords: ['limpeza', 'zelador', 'zeladora', 'faxineiro', 'faxineira', 'auxiliar de limpeza', 'higienização', 'camareira'],
    area: { name: 'Limpeza & Conservação', slug: 'limpeza', icon: 'Sparkles', themeColor: 'cyan' },
  },
  {
    keywords: ['porteiro', 'porteira', 'segurança', 'vigilante', 'guarda', 'vigia', 'recepção', 'recepcionista'],
    area: { name: 'Segurança & Recepção', slug: 'seguranca', icon: 'Shield', themeColor: 'slate' },
  },
  {
    keywords: ['professor', 'professora', 'educador', 'educadora', 'pedagogo', 'pedagoga', 'coordenador pedagógico', 'instrutor', 'tutora', 'tutor', 'docente', 'lecionar', 'ensino'],
    area: { name: 'Educação', slug: 'educacao', icon: 'GraduationCap', themeColor: 'indigo' },
  },
  {
    keywords: ['designer', 'design', 'criativo', 'criativa', 'publicidade', 'propaganda', 'marketing', 'social media', 'fotógrafo', 'fotógrafa', 'illustr', 'ux', 'ui ', ' ui', 'motion', 'vídeo', 'conteúdo', 'redator', 'redatora'],
    area: { name: 'Design & Marketing', slug: 'design', icon: 'Palette', themeColor: 'violet' },
  },
  {
    keywords: ['pedreiro', 'eletricista', 'encanador', 'carpinteiro', 'pintor', 'pintura', 'azulejista', 'obras', 'construção civil', 'engenharia civil', 'mestre de obras'],
    area: { name: 'Construção Civil', slug: 'construcao', icon: 'HardHat', themeColor: 'orange' },
  },
  {
    keywords: ['administrativo', 'administração', 'assistente administrativo', 'auxiliar administrativo', 'financeiro', 'contábil', 'contador', 'contadora', 'rh', 'recursos humanos', 'dp', 'departamento pessoal', 'secretária', 'secretário'],
    area: { name: 'Administrativo', slug: 'administrativo', icon: 'ClipboardList', themeColor: 'teal' },
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
  return { name, slug, icon: 'Briefcase', themeColor: 'slate' };
}
