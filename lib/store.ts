import { create } from 'zustand';

export type User = {
  id: string;
  username: string;
  name: string;
  photo_url: string;
  headline: string;
  summary: string;
  location: string;
};

export type ProfessionalArea = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  theme_color: string;
};

export type Experience = {
  id: string;
  user_id: string;
  area_id: string;
  company_name: string;
  company_logo: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
};

export type Skill = {
  id: string;
  name: string;
  icon: string;
};

export type AreaSkill = {
  id: string;
  area_id: string;
  skill_id: string;
  level: number; // 1-100
};

export type Education = {
  id: string;
  user_id: string;
  institution: string;
  course: string;
  start_date: string;
  end_date: string | null;
};

interface AppState {
  currentUser: User | null;
  users: User[];
  areas: ProfessionalArea[];
  experiences: Experience[];
  skills: Skill[];
  areaSkills: AreaSkill[];
  education: Education[];
  login: (username: string) => void;
  logout: () => void;
}

const mockUsers: User[] = [
  {
    id: '1',
    username: 'kardec',
    name: 'Allan Kardec',
    photo_url: 'https://picsum.photos/seed/kardec/200/200',
    headline: 'Profissional Multidisciplinar',
    summary: 'Experiência em diversas áreas, buscando sempre aprender e entregar o melhor resultado.',
    location: 'São Paulo, SP',
  },
];

const mockAreas: ProfessionalArea[] = [
  { id: 'a1', name: 'Auxiliar de Cozinha', slug: 'auxiliar-cozinha', icon: 'ChefHat', theme_color: 'orange' },
  { id: 'a2', name: 'Atendente', slug: 'atendente', icon: 'MessageSquare', theme_color: 'blue' },
  { id: 'a3', name: 'Estoquista', slug: 'estoquista', icon: 'Package', theme_color: 'green' },
];

const mockExperiences: Experience[] = [
  {
    id: 'e1',
    user_id: '1',
    area_id: 'a1',
    company_name: 'Burger House',
    company_logo: 'https://picsum.photos/seed/burger/100/100',
    role: 'Auxiliar de Cozinha',
    start_date: '2022-01-01',
    end_date: '2023-12-31',
    description: 'Preparo de ingredientes, montagem de hambúrguer e organização da cozinha.',
  },
  {
    id: 'e2',
    user_id: '1',
    area_id: 'a2',
    company_name: 'Tech Store',
    company_logo: 'https://picsum.photos/seed/tech/100/100',
    role: 'Atendente de Loja',
    start_date: '2021-03-01',
    end_date: '2021-12-31',
    description: 'Atendimento ao cliente, vendas de eletrônicos e organização do salão.',
  },
  {
    id: 'e3',
    user_id: '1',
    area_id: 'a3',
    company_name: 'Logistics Pro',
    company_logo: 'https://picsum.photos/seed/logistics/100/100',
    role: 'Estoquista',
    start_date: '2024-01-01',
    end_date: null,
    description: 'Recebimento de mercadorias, controle de inventário e separação de pedidos.',
  },
];

const mockSkills: Skill[] = [
  { id: 's1', name: 'Corte de ingredientes', icon: 'Knife' },
  { id: 's2', name: 'Chapa / Grill', icon: 'Flame' },
  { id: 's3', name: 'Organização de cozinha', icon: 'LayoutList' },
  { id: 's4', name: 'Atendimento ao público', icon: 'Users' },
  { id: 's5', name: 'Vendas', icon: 'DollarSign' },
  { id: 's6', name: 'Controle de inventário', icon: 'ClipboardList' },
  { id: 's7', name: 'Operação de empilhadeira', icon: 'Truck' },
];

const mockAreaSkills: AreaSkill[] = [
  { id: 'as1', area_id: 'a1', skill_id: 's1', level: 80 },
  { id: 'as2', area_id: 'a1', skill_id: 's2', level: 70 },
  { id: 'as3', area_id: 'a1', skill_id: 's3', level: 90 },
  { id: 'as4', area_id: 'a2', skill_id: 's4', level: 85 },
  { id: 'as5', area_id: 'a2', skill_id: 's5', level: 75 },
  { id: 'as6', area_id: 'a3', skill_id: 's6', level: 95 },
  { id: 'as7', area_id: 'a3', skill_id: 's7', level: 60 },
];

const mockEducation: Education[] = [
  {
    id: 'ed1',
    user_id: '1',
    institution: 'Senac',
    course: 'Técnico em Gastronomia',
    start_date: '2021-01-01',
    end_date: '2022-12-31',
  },
];

export const useStore = create<AppState>((set) => ({
  currentUser: mockUsers[0], // Auto-login for prototype
  users: mockUsers,
  areas: mockAreas,
  experiences: mockExperiences,
  skills: mockSkills,
  areaSkills: mockAreaSkills,
  education: mockEducation,
  login: (username) => set((state) => ({ currentUser: state.users.find(u => u.username === username) || null })),
  logout: () => set({ currentUser: null }),
}));
