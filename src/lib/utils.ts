import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInMonths, differenceInYears, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const slugify = (text: string) => 
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40);

export const parseSafeDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length >= 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
  }
  return new Date(dateStr);
};

export function calcDuration(startDate: string | null, endDate: string | null): string {
  if (!startDate) return '1 mês';
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

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Data não informada';
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
    keywords: ['programador', 'desenvolved', 'developer', 'software', 'tech', 'ti ', 'dados', 'react', 'javascript', 'typescript', 'python', 'java', 'node', 'backend', 'frontend', 'web', 'mobile', 'android', 'ios', 'computa', 'sistemas', 'infra', 'rede', 'cloud', 'aws', 'azure', 'devops', 'segurança da info', 'hacker', 'tester', 'qa', 'banco de dados', 'database', 'estatístico', 'cientista de dados'],
    area: { name: 'Tecnologia', slug: 'tecnologia', icon: 'Code2', themeColor: '#3b82f6' },
  },
  {
    keywords: ['saúde', 'enfermeiro', 'médico', 'hospital', 'fisiotera', 'nutricion', 'psicolog', 'anatomia', 'clínica', 'dentista', 'odonto', 'farmacêutico', 'biomed', 'veterinário', 'uti', 'socorrista', 'terapeuta', 'fonoaudió', 'radiologista', 'cirurgião', 'obstetra', 'pediatra', 'clínico'],
    area: { name: 'Saúde', slug: 'saude', icon: 'Heart', themeColor: '#10b981' },
  },
  {
    keywords: ['cozinha', 'cozinheiro', 'chef', 'gastronomia', 'pizz', 'padari', 'restaurante', 'barman', 'culinária', 'garçom', 'atendente de mesa', 'maître', 'sommelier', 'barista', 'confeiteiro', 'padeiro', 'churrasqueiro', 'auxiliar de cozinha', 'copeiro', 'gastronômico'],
    area: { name: 'Gastronomia', slug: 'gastronomia', icon: 'ChefHat', themeColor: '#f97316' },
  },
  {
    keywords: ['vendas', 'comercial', 'vendedor', 'atendente', 'caixa', 'balconista', 'pdv', 'estoque', 'lojista', 'promotor', 'representante', 'key account', 'executivo de contas', 'merchandising', 'varejo', 'comércio', 'consultor de vendas', 'shopping', 'telemarketing', 'call center'],
    area: { name: 'Vendas & Atendimento', slug: 'vendas', icon: 'ShoppingBag', themeColor: '#8b5cf6' },
  },
  {
    keywords: ['administrativo', 'auxiliar administrativo', 'financeiro', 'rh', 'secretária', 'office', 'excel', 'gestão', 'recursos humanos', 'contabilidade', 'fiscal', 'faturamento', 'dp', 'pessoal', 'recepcionista', 'gerente', 'diretor', 'analista', 'assistente', 'comprador', 'suprimentos', 'compliance', 'jurídico', 'advogado'],
    area: { name: 'Administrativo & Negócios', slug: 'administrativo', icon: 'ClipboardList', themeColor: '#14b8a6' },
  },
  {
    keywords: ['logística', 'transporte', 'caminhoneiro', 'motorista', 'entrega', 'motoboy', 'almoxarif', 'expedição', 'frete', 'frota', 'estoquista', 'operador de empilhadeira', 'suplemento', 'supply chain', 'armazém', 'depósito'],
    area: { name: 'Logística & Transporte', slug: 'logistica', icon: 'Package', themeColor: '#0284c7' },
  },
  {
    keywords: ['educação', 'professor', 'mestre', 'doutor', 'pedagogo', 'tutor', 'instrutor', 'diretor escolar', 'coordenação pedagógica', 'ensino', 'aula', 'palestrante', 'coach', 'treinador'],
    area: { name: 'Educação', slug: 'educacao', icon: 'GraduationCap', themeColor: '#6366f1' },
  },
  {
    keywords: ['marketing', 'comunicação', 'publicidade', 'propaganda', 'social media', 'copywriter', 'redator', 'jornalista', 'assessor', 'branding', 'seo', 'tráfego pago', 'growth', 'eventos', 'cerimonialista', 'relacionamento'],
    area: { name: 'Marketing & Comunicação', slug: 'marketing', icon: 'Megaphone', themeColor: '#ec4899' },
  },
  {
    keywords: ['design', 'arte', 'designer', 'ilustrador', 'animador', 'motion', 'vídeo', 'editor', 'fotógrafo', 'câmera', 'diretor de arte', 'ux', 'ui', 'produto', 'moda', 'estilista', 'modelagem'],
    area: { name: 'Design & Artes', slug: 'design', icon: 'Palette', themeColor: '#7c3aed' },
  },
  {
    keywords: ['engenharia', 'engenheiro', 'civil', 'mecânico', 'elétrico', 'produção', 'químico', 'ambiental', 'arquiteto', 'urbanista', 'topógrafo', 'projetista', 'autocad', 'bim'],
    area: { name: 'Engenharia & Arquitetura', slug: 'engenharia', icon: 'Ruler', themeColor: '#475569' },
  },
  {
    keywords: ['construção', 'pedreiro', 'mestre de obras', 'servente', 'pintor', 'encanador', 'eletricista', 'gesseiro', 'azulejista', 'marceneiro', 'serralheiro', 'vidraceiro', 'reforma'],
    area: { name: 'Construção Civil', slug: 'construcao', icon: 'HardHat', themeColor: '#d97706' },
  },
  {
    keywords: ['beleza', 'estética', 'cabeleireiro', 'barbeiro', 'manicure', 'pedicure', 'maquiador', 'esteticista', 'depila', 'massagista', 'spa', 'bem-estar', 'terapia holística', 'cosmético'],
    area: { name: 'Beleza & Estética', slug: 'beleza', icon: 'Sparkles', themeColor: '#f472b6' },
  },
  {
    keywords: ['segurança', 'vigilante', 'porteiro', 'guarda', 'inspetor', 'monitoramento', 'escolta', 'policial', 'militar', 'bombeiro', 'brigadista', 'risco', 'prevenção'],
    area: { name: 'Segurança', slug: 'seguranca', icon: 'Shield', themeColor: '#334155' },
  },
  {
    keywords: ['serviços gerais', 'limpeza', 'faxina', 'conservação', 'zelador', 'jardineiro', 'piscineiro', 'manutenção', 'reparos', 'auxiliar de serviços'],
    area: { name: 'Serviços Gerais', slug: 'limpeza', icon: 'Wind', themeColor: '#06b6d4' },
  },
  {
    keywords: ['agronegócio', 'rural', 'fazenda', 'agricultor', 'pecuária', 'agronômo', 'zootecnista', 'tratorista', 'campo', 'colheita', 'veterinário de grandes', 'agrícola'],
    area: { name: 'Agronegócio', slug: 'agro', icon: 'Sprout', themeColor: '#65a30d' },
  },
  {
    keywords: ['jurídico', 'advogado', 'bacharel em direito', 'paralegal', 'escrivão', 'notário', 'oficial', 'promotor', 'juiz', 'defensor', 'auditor', 'perito'],
    area: { name: 'Jurídico', slug: 'juridico', icon: 'Scale', themeColor: '#1e40af' },
  },
  {
    keywords: ['turismo', 'hotelaria', 'receptivo', 'guia', 'agente de viagem', 'hostess', 'camareira', 'concierge', 'tripulante', 'comissário', 'piloto'],
    area: { name: 'Turismo & Hotelaria', slug: 'turismo', icon: 'Plane', themeColor: '#ea580c' },
  },
  {
    keywords: ['indústria', 'operador', 'máquina', 'torneiro', 'soldador', 'ajustador', 'fundição', 'qualidade', 'metrologia', 'usinagem', 'caldeireiro'],
    area: { name: 'Indústria & Produção', slug: 'industria', icon: 'Factory', themeColor: '#b91c1c' },
  }
];

export function detectAreaFromRole(role: string): DetectedArea {
  const roleLower = ` ${role.toLowerCase()} `;
  for (const rule of AREA_RULES) {
    if (rule.keywords.some(kw => roleLower.includes(kw))) {
      return rule.area;
    }
  }
  const name = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  const slug = slugify(name);
  return { name, slug, icon: 'Briefcase', themeColor: '#64748b' };
}

export function getRelevantAreaSlugsForSkill(skillName: string): string[] {
  const skillLower = skillName.toLowerCase();
  const matchedSlugs: string[] = [];
  
  for (const rule of AREA_RULES) {
    if (rule.keywords.some(kw => skillLower.includes(kw))) {
      matchedSlugs.push(rule.area.slug);
    }
  }
  
  return matchedSlugs;
}
