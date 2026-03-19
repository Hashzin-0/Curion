
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInMonths, differenceInYears, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import crypto from 'crypto'

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

/**
 * Gera um hash determinístico para simular Proof of Work em blockchain.
 */
export function generateProjectHash(name: string, description: string, date: string): string {
  const content = `${name}|${description}|${date}|CURION_X_IMMUTABLE_PROTOCOL`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

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
    keywords: ['programador', 'desenvolved', 'developer', 'software', 'tech', 'ti ', 'dados', 'react', 'javascript', 'typescript', 'python', 'java', 'node', 'backend', 'frontend', 'web', 'mobile', 'android', 'ios', 'computa', 'sistemas', 'infra', 'rede', 'cloud', 'aws', 'azure', 'devops', 'segurança da info', 'hacker', 'tester', 'qa', 'banco de dados', 'database', 'estatístico', 'cientista de dados', 'bi ', 'inteligência artificial', 'ia ', 'ai ', 'machine learning', 'blockchain', 'cripto', 'games', 'jogos', 'unity', 'unreal', 'dev ', 'fullstack', 'php', 'laravel', 'c#', 'dot net', 'asp.net', 'ruby', 'rails', 'flutter', 'react native', 'angular', 'vue', 'scrum master', 'po ', 'agile', 'cyber', 'suporte técnico', 'helpdesk', 'redes', 'cloud engineering', 'data analytics', 'data engineer', 'prompt engineering', 'cybersecurity'],
    area: { name: 'Tecnologia & Inovação', slug: 'tecnologia', icon: 'Code2', themeColor: '#3b82f6' },
  },
  {
    keywords: ['saúde', 'enfermeiro', 'médico', 'hospital', 'fisiotera', 'nutricion', 'psicolog', 'anatomia', 'clínica', 'dentista', 'odonto', 'farmacêutico', 'biomed', 'veterinário', 'uti', 'socorrista', 'terapeuta', 'fonoaudió', 'radiologista', 'cirurgião', 'obstetra', 'pediatra', 'clínico', 'psiquiatra', 'neurologista', 'cardiologista', 'ortopedista', 'dermatologista', 'oftalmologista', 'anestesista', 'geriatra', 'infectologista', 'home care', 'cuidador', 'instrumentador', 'sanitarista', 'epidemiologista', 'toxicologista'],
    area: { name: 'Saúde & Bem-estar', slug: 'saude', icon: 'Heart', themeColor: '#10b981' },
  },
  {
    keywords: ['cozinha', 'cozinheiro', 'chef', 'gastronomia', 'pizz', 'padari', 'restaurante', 'barman', 'culinária', 'garçom', 'atendente de mesa', 'maître', 'sommelier', 'barista', 'confeiteiro', 'padeiro', 'churrasqueiro', 'auxiliar de cozinha', 'copeiro', 'gastronômico', 'buffet', 'catering', 'mixologista', 'pizzaiolo', 'sushiman', 'chocolatier'],
    area: { name: 'Gastronomia & Alimentos', slug: 'gastronomia', icon: 'ChefHat', themeColor: '#f97316' },
  },
  {
    keywords: ['vendas', 'comercial', 'vendedor', 'atendente', 'caixa', 'balconista', 'pdv', 'estoque', 'lojista', 'promotor', 'representante', 'key account', 'executivo de contas', 'merchandising', 'varejo', 'comércio', 'consultor de vendas', 'shopping', 'telemarketing', 'call center', 'customer success', 'customer experience', 'cx ', 'sac ', 'pré-vendas', 'sdr ', 'bdr ', 'inside sales', 'field sales'],
    area: { name: 'Vendas & Atendimento', slug: 'vendas', icon: 'ShoppingBag', themeColor: '#8b5cf6' },
  },
  {
    keywords: ['administrativo', 'auxiliar administrativo', 'financeiro', 'rh ', 'secretária', 'office', 'excel', 'gestão', 'recursos humanos', 'contabilidade', 'fiscal', 'faturamento', 'dp ', 'pessoal', 'recepcionista', 'gerente', 'diretor', 'analista', 'assistente', 'comprador', 'suprimentos', 'compliance', 'jurídico', 'advogado', 'auditor', 'controladoria', 'processos', 'facilities', 'facilities manager', 'office manager', 'ceo', 'cfo', 'coo', 'clp', 'tesouraria', 'contábil'],
    area: { name: 'Administrativo & Negócios', slug: 'administrativo', icon: 'ClipboardList', themeColor: '#14b8a6' },
  },
  {
    keywords: ['logística', 'transporte', 'caminhoneiro', 'motorista', 'entrega', 'motoboy', 'almoxarif', 'expedição', 'frete', 'frota', 'estoquista', 'operador de empilhadeira', 'suplemento', 'supply chain', 'armazém', 'depósito', 'centro de distribuição', 'last mile', 'planejamento logístico', 'importação', 'exportação', 'comex', 'desembaraço', 'alfandegário', 'marítimo', 'aéreo', 'rodoviário', 'ferroviário'],
    area: { name: 'Logística & Transporte', slug: 'logistica', icon: 'Package', themeColor: '#0284c7' },
  },
  {
    keywords: ['educação', 'professor', 'mestre', 'doutor', 'pedagogo', 'tutor', 'instrutor', 'diretor escolar', 'coordenação pedagógica', 'ensino', 'aula', 'palestrante', 'coach', 'treinador', 'acadêmico', 'pesquisador', 'reitor', 'monitor', 'educador', 'alfabetizador', 'psicopedagogo', 'bibliotecário', 'orientador'],
    area: { name: 'Educação & Ensino', slug: 'educacao', icon: 'GraduationCap', themeColor: '#6366f1' },
  },
  {
    keywords: ['marketing', 'comunicação', 'publicidade', 'propaganda', 'social media', 'copywriter', 'redator', 'jornalista', 'assessor', 'branding', 'seo ', 'tráfego pago', 'growth', 'eventos', 'cerimonialista', 'relacionamento', 'influenciador', 'mídia', 'comprador de mídia', 'performance', 'e-mail marketing', 'afiliados', 'comunidade'],
    area: { name: 'Marketing & Comunicação', slug: 'marketing', icon: 'Megaphone', themeColor: '#ec4899' },
  },
  {
    keywords: ['design', 'arte', 'designer', 'ilustrador', 'animador', 'motion', 'vídeo', 'editor', 'fotógrafo', 'câmera', 'diretor de arte', 'ux ', 'ui ', 'produto', 'moda', 'estilista', 'modelagem', 'interior', 'interiores', 'cenógrafo', 'figurista', 'vitrinista', '3d artist', 'concept artist', 'game design', 'infografista'],
    area: { name: 'Design & Criatividade', slug: 'design', icon: 'Palette', themeColor: '#7c3aed' },
  },
  {
    keywords: ['engenharia', 'engenheiro', 'civil', 'mecânico', 'elétrico', 'produção', 'químico', 'ambiental', 'arquiteto', 'urbanista', 'topógrafo', 'projetista', 'autocad', 'bim', 'revit', 'sketchup', 'agrimensor', 'estrutural', 'hidráulico', 'mecatrônico', 'aeronáutico', 'naval', 'metalúrgico', 'geólogo', 'minas', 'petróleo'],
    area: { name: 'Engenharia & Arquitetura', slug: 'engenharia', icon: 'Ruler', themeColor: '#475569' },
  },
  {
    keywords: ['construção', 'pedreiro', 'mestre de obras', 'servente', 'pintor', 'encanador', 'eletricista', 'gesseiro', 'azulejista', 'marceneiro', 'serralheiro', 'vidraceiro', 'reforma', 'impermeabilizador', 'carpinteiro', 'soldador', 'montador', 'andaimista', 'escavador', 'pavimentador'],
    area: { name: 'Construção Civil', slug: 'construcao', icon: 'HardHat', themeColor: '#d97706' },
  },
  {
    keywords: ['beleza', 'estética', 'cabeleireiro', 'barbeiro', 'manicure', 'pedicure', 'maquiador', 'esteticista', 'depila', 'massagista', 'spa ', 'bem-estar', 'terapia holística', 'cosmético', 'visagista', 'colorista', 'extensão de cílios', 'sobrancelhas', 'micropigmentador', 'podólogo', 'terapeuta capilar'],
    area: { name: 'Beleza & Estética', slug: 'beleza', icon: 'Sparkles', themeColor: '#f472b6' },
  },
  {
    keywords: ['segurança', 'vigilante', 'porteiro', 'guarda', 'inspetor', 'monitoramento', 'escolta', 'policial', 'militar', 'bombeiro', 'brigadista', 'risco', 'prevenção', 'segurança do trabalho', 'técnico de segurança', 'patrimonial', 'armado', 'vspp', 'segurança eletrônica', 'perito', 'investigador'],
    area: { name: 'Segurança & Proteção', slug: 'seguranca', icon: 'Shield', themeColor: '#334155' },
  },
  {
    keywords: ['serviços gerais', 'limpeza', 'faxina', 'conservação', 'zelador', 'jardineiro', 'piscineiro', 'manutenção', 'reparos', 'auxiliar de serviços', 'copeira', 'mensageiro', 'ascensorista', 'lavador', 'passadeira', 'arrumadeira', 'camareira'],
    area: { name: 'Serviços Gerais & Manutenção', slug: 'limpeza', icon: 'Wind', themeColor: '#06b6d4' },
  },
  {
    keywords: ['agronegócio', 'rural', 'fazenda', 'agricultor', 'pecuária', 'agronômo', 'zootecnista', 'tratorista', 'campo', 'colheita', 'veterinário', 'agrícola', 'florestal', 'silvicultura', 'irrigação', 'piscicultura', 'apicultura', 'agrotech', 'agrimensura', 'gado', 'soja', 'milho', 'safra'],
    area: { name: 'Agronegócio & Campo', slug: 'agro', icon: 'Sprout', themeColor: '#65a30d' },
  },
  {
    keywords: ['jurídico', 'advogado', 'bacharel em direito', 'paralegal', 'escrivão', 'notário', 'oficial', 'promotor', 'juiz', 'defensor', 'auditor', 'perito', 'conciliador', 'mediador', 'tabelião', 'assessor jurídico', 'procurador', 'advocacia', 'legal counsel'],
    area: { name: 'Jurídico & Legal', slug: 'juridico', icon: 'Scale', themeColor: '#1e40af' },
  },
  {
    keywords: ['turismo', 'hotelaria', 'receptivo', 'guia', 'agente de viagem', 'hostess', 'camareira', 'concierge', 'tripulante', 'comissário', 'piloto', 'capitão', 'eventos', 'organizador', 'passagens', 'excursionista', 'intercâmbio', 'reservas'],
    area: { name: 'Turismo & Hotelaria', slug: 'turismo', icon: 'Plane', themeColor: '#ea580c' },
  },
  {
    keywords: ['indústria', 'operador', 'máquina', 'torneiro', 'soldador', 'ajustador', 'fundição', 'qualidade', 'metrologia', 'usinagem', 'caldeireiro', 'fresador', 'mecânico industrial', 'manutenção industrial', 'linha de montagem', 'produção industrial', 'prensista', 'extrusor', 'injeção', 'cnc '],
    area: { name: 'Indústria & Produção', slug: 'industria', icon: 'Factory', themeColor: '#b91c1c' },
  },
  {
    keywords: ['finanças', 'bancário', 'trader', 'investimentos', 'banco', 'crédito', 'cobrança', 'caixa bancário', 'agente financeiro', 'analista de investimentos', 'compliance', 'risco financeiro', 'wealth management', 'private equity', 'merger', 'm&a', 'asset', 'fundos', 'corretora'],
    area: { name: 'Finanças & Bancário', slug: 'financas', icon: 'DollarSign', themeColor: '#059669' },
  },
  {
    keywords: ['rh ', 'recursos humanos', 'recrutamento', 'seleção', 'headhunter', 'treinamento', 'desenvolvimento', 'tech recruiter', 'people partner', 'clima organizacional', 'remuneração', 'benefícios', 'endomarketing', 'talentos', 'people analytics'],
    area: { name: 'RH & Talentos', slug: 'rh', icon: 'Users', themeColor: '#f59e0b' },
  },
  {
    keywords: ['ciência', 'laboratório', 'pesquisador', 'biólogo', 'químico', 'físico', 'cientista', 'microbiologista', 'biotecnologia', 'farmacologia', 'genética', 'neurociência', 'geofísico', 'meteorologista', 'oceanógrafo', 'astrônomo'],
    area: { name: 'Ciências & Pesquisa', slug: 'ciencia', icon: 'FlaskConical', themeColor: '#7c3aed' },
  },
  {
    keywords: ['artes', 'música', 'músico', 'cantor', 'ator', 'atriz', 'dançarino', 'teatro', 'cinema', 'produtor cultural', 'curador', 'instrumentista', 'compositor', 'maestro', 'sonoplasta', 'iluminador', 'coreógrafo', 'artista plástico'],
    area: { name: 'Artes & Espetáculo', slug: 'artes', icon: 'Music', themeColor: '#ec4899' },
  },
  {
    keywords: ['imobiliário', 'corretor de imóveis', 'imobiliária', 'avaliador de imóveis', 'síndico', 'administradora de condomínios', 'locação', 'vendas de imóveis', 'consultor imobiliário', 'loteamento', 'incorporação'],
    area: { name: 'Imobiliário & Condomínios', slug: 'imobiliario', icon: 'Building', themeColor: '#1e293b' },
  },
  {
    keywords: ['esportes', 'atleta', 'treinador', 'personal trainer', 'professor de educação física', 'árbitro', 'recreador', 'yoga', 'pilates', 'fisiculturista', 'olímpico', 'clube', 'academia', 'gestão esportiva'],
    area: { name: 'Esportes & Fitness', slug: 'esportes', icon: 'Trophy', themeColor: '#ef4444' },
  },
  {
    keywords: ['meio ambiente', 'ecologia', 'sustentabilidade', 'gestão de resíduos', 'energias renováveis', 'solar', 'eólica', 'reciclagem', 'tratamento de água', 'efluentes', 'educação ambiental', 'biocombustíveis', 'esg '],
    area: { name: 'Ambiental & Sustentabilidade', slug: 'meio_ambiente', icon: 'Leaf', themeColor: '#10b981' },
  },
  {
    keywords: ['social', 'assistente social', 'ong', 'voluntário', 'terceiro setor', 'captação de recursos', 'direitos humanos', 'filantropia', 'desenvolvimento social', 'projetos sociais', 'comunitário'],
    area: { name: 'Social & ONGs', slug: 'social', icon: 'Globe', themeColor: '#6366f1' },
  },
  {
    keywords: ['moda', 'estilista', 'costureira', 'modelista', 'alfaiate', 'tecelagem', 'visual merchandising', 'vitrinista', 'têxtil', 'confecção', 'modelagem', 'estamparia', 'personal shopper', 'figurino'],
    area: { name: 'Moda & Têxtil', slug: 'moda', icon: 'Shirt', themeColor: '#be185d' },
  },
  {
    keywords: ['mídia', 'jornalismo', 'repórter', 'editor', 'apresentador', 'podcaster', 'locutor', 'radialista', 'âncora', 'correspondente', 'colunista', 'revisor', 'tradutor', 'intérprete', 'dublador'],
    area: { name: 'Mídia & Editorial', slug: 'midia', icon: 'Mic', themeColor: '#475569' },
  },
  {
    keywords: ['seguros', 'corretor de seguros', 'atuário', 'sinistro', 'previdência', 'inspetor de riscos', 'vistoriador', 'subscritor', 'corretagem', 'resseguro', 'capitalização'],
    area: { name: 'Seguros & Riscos', slug: 'seguros', icon: 'Umbrella', themeColor: '#1d4ed8' },
  },
  {
    keywords: ['energia', 'petróleo', 'gás', 'mineração', 'elétrica', 'geração de energia', 'linhas de transmissão', 'perfuração', 'geólogo', 'extração', 'refinaria', 'offshore', 'onshore'],
    area: { name: 'Energia & Mineração', slug: 'energia', icon: 'Zap', themeColor: '#ca8a04' },
  },
  {
    keywords: ['pets', 'veterinário', 'banho e tosa', 'pet shop', 'adestrador', 'passeador de cães', 'groomer', 'clínica veterinária', 'auxiliar veterinário', 'aquarista', 'pet care'],
    area: { name: 'Pets & Animais', slug: 'pets', icon: 'Dog', themeColor: '#f97316' },
  },
  {
    keywords: ['automotivo', 'mecânico', 'funileiro', 'pintor automotivo', 'eletricista de autos', 'borracheiro', 'alinhador', 'centro automotivo', 'retífica', 'autopeças', 'vendedor de carros', 'concerto de motos'],
    area: { name: 'Automotivo & Mecânica', slug: 'automotivo', icon: 'Car', themeColor: '#334155' },
  },
  {
    keywords: ['militar', 'exército', 'marinha', 'aeronáutica', 'policial militar', 'bombeiro militar', 'forças armadas', 'guarda municipal', 'polícia civil', 'polícia federal', 'agente penitenciário'],
    area: { name: 'Militar & Segurança Pública', slug: 'militar', icon: 'Sword', themeColor: '#166534' },
  },
  {
    keywords: ['serviço público', 'concursado', 'servidor público', 'agente administrativo', 'prefeitura', 'governo', 'estadual', 'federal', 'diplomata', 'gestor público', 'políticas públicas'],
    area: { name: 'Governo & Setor Público', slug: 'servicos_publicos', icon: 'Building2', themeColor: '#4b5563' },
  },
  {
    keywords: ['religioso', 'pastor', 'padre', 'missionário', 'teólogo', 'líder espiritual', 'capelão', 'convento', 'seminarista', 'paróquia', 'igreja'],
    area: { name: 'Religioso & Espiritual', slug: 'religioso', icon: 'Sun', themeColor: '#78350f' }
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
