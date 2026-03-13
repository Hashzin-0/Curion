import { create } from 'zustand';
import { supabase } from './supabase';
import { detectAreaFromRole } from './utils';

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

export type Achievement = {
  id: string;
  user_id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
};

export type Certificate = {
  id: string;
  user_id: string;
  title: string;
  institution: string;
  date: string;
  file_url?: string;
  description?: string;
};

export type PortfolioItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url?: string;
  link_url?: string;
  tags?: string[];
};

export type RecommendationLetter = {
  id: string;
  user_id: string;
  author_name: string;
  author_position: string;
  author_company: string;
  content: string;
  date: string;
  file_url?: string;
};

interface AppState {
  currentUser: User | null;
  users: User[];
  areas: ProfessionalArea[];
  experiences: Experience[];
  skills: Skill[];
  areaSkills: AreaSkill[];
  education: Education[];
  achievements: Achievement[];
  certificates: Certificate[];
  portfolio: PortfolioItem[];
  recommendations: RecommendationLetter[];
  isLoading: boolean;
  isAuthReady: boolean;
  login: (username: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  syncUserWithDatabase: (userData: Partial<User>) => Promise<User | null>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  addExperience: (experience: Omit<Experience, 'id'>) => Promise<void>;
  addExperienceWithAutoArea: (exp: Omit<Experience, 'id' | 'area_id'>) => Promise<void>;
  addEducation: (education: Omit<Education, 'id'>) => Promise<void>;
  addAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<void>;
  addCertificate: (certificate: Omit<Certificate, 'id'>) => Promise<void>;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  addRecommendation: (recommendation: Omit<RecommendationLetter, 'id'>) => Promise<void>;
  addArea: (area: Omit<ProfessionalArea, 'id'>) => Promise<void>;
  updateArea: (area: ProfessionalArea) => Promise<void>;
  removeArea: (areaId: string) => Promise<void>;
  fetchData: () => Promise<void>;
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

const mockAchievements: Achievement[] = [
  {
    id: 'ac1',
    user_id: '1',
    title: 'Melhor Atendente do Mês',
    organization: 'Tech Store',
    date: '2021-08-01',
    description: 'Reconhecimento por excelência no atendimento ao cliente e metas de vendas.',
  }
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: mockUsers,
  areas: mockAreas,
  experiences: mockExperiences,
  skills: mockSkills,
  areaSkills: mockAreaSkills,
  education: mockEducation,
  achievements: mockAchievements,
  certificates: [],
  portfolio: [],
  recommendations: [],
  isLoading: false,
  isAuthReady: false,
  
  login: (username) => set((state) => ({ currentUser: state.users.find(u => u.username === username) || null })),
  logout: () => set({ currentUser: null }),
  setUser: (user) => set({ currentUser: user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),

  syncUserWithDatabase: async (userData) => {
    if (!userData.id) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          username: userData.username,
          name: userData.name,
          photo_url: userData.photo_url,
          headline: userData.headline || 'Profissional',
          summary: userData.summary || 'Bem-vindo ao meu perfil.',
          location: userData.location || 'Brasil',
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.warn('Could not sync with DB, using local state:', error.message);
        return userData as User;
      }

      set((state) => ({ currentUser: data }));
      return data;
    } catch (err) {
      console.error('Error syncing user:', err);
      return userData as User;
    }
  },

  updateUser: async (userData) => {
    const { currentUser, users } = get();
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      // Atualiza currentUser e também o array de users
      set((state) => ({
        currentUser: data,
        users: state.users.map(u => u.id === data.id ? data : u),
      }));
    } catch (err) {
      console.error('Error updating user:', err);
    }
  },
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        set({ isLoading: false });
        return;
      }

      const [
        { data: users },
        { data: areas },
        { data: experiences },
        { data: skills },
        { data: areaSkills },
        { data: education },
        { data: achievements },
        { data: certificates },
        { data: portfolio },
        { data: recommendations }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('areas').select('*'),
        supabase.from('experiences').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('area_skills').select('*'),
        supabase.from('education').select('*'),
        supabase.from('achievements').select('*'),
        supabase.from('certificates').select('*'),
        supabase.from('portfolio').select('*'),
        supabase.from('recommendations').select('*')
      ]);

      set({
        users: users || mockUsers,
        areas: areas || mockAreas,
        experiences: experiences || mockExperiences,
        skills: skills || mockSkills,
        areaSkills: areaSkills || mockAreaSkills,
        education: education || mockEducation,
        achievements: achievements || mockAchievements,
        certificates: certificates || [],
        portfolio: portfolio || [],
        recommendations: recommendations || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      set({ isLoading: false });
    }
  },

  addExperience: async (experience) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('experiences').insert([experience]).select().single();
        if (error) throw error;
        set((state) => ({ experiences: [data, ...state.experiences] }));
      } else {
        set((state) => ({ experiences: [{ ...experience, id: `e${Date.now()}` }, ...state.experiences] }));
      }
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  },

  addExperienceWithAutoArea: async (exp) => {
    const { areas, addArea, addExperience } = get();
    const detected = detectAreaFromRole(exp.role);
    let area = areas.find(a => a.slug === detected.slug);
    if (!area) {
      await addArea({
        name: detected.name,
        slug: detected.slug,
        icon: detected.icon,
        theme_color: detected.themeColor,
      });
      area = get().areas.find(a => a.slug === detected.slug);
    }
    if (!area) return;
    await addExperience({ ...exp, area_id: area.id });
  },
  
  addEducation: async (education) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('education').insert([education]).select().single();
        if (error) throw error;
        set((state) => ({ education: [data, ...state.education] }));
      } else {
        set((state) => ({ education: [{ ...education, id: `ed${Date.now()}` }, ...state.education] }));
      }
    } catch (error) {
      console.error('Error adding education:', error);
    }
  },
  
  addAchievement: async (achievement) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('achievements').insert([achievement]).select().single();
        if (error) throw error;
        set((state) => ({ achievements: [data, ...state.achievements] }));
      } else {
        set((state) => ({ achievements: [{ ...achievement, id: `ac${Date.now()}` }, ...state.achievements] }));
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  },
  
  addArea: async (area) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('areas').insert([area]).select().single();
        if (error) throw error;
        set((state) => ({ areas: [...state.areas, data] }));
      } else {
        set((state) => ({ areas: [...state.areas, { ...area, id: `a${Date.now()}` }] }));
      }
    } catch (error) {
      console.error('Error adding area:', error);
    }
  },

  updateArea: async (area) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('areas').update(area).eq('id', area.id).select().single();
        if (error) throw error;
        set((state) => ({ areas: state.areas.map(a => a.id === area.id ? data : a) }));
      } else {
        set((state) => ({ areas: state.areas.map(a => a.id === area.id ? area : a) }));
      }
    } catch (error) {
      console.error('Error updating area:', error);
    }
  },

  removeArea: async (areaId) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { error } = await supabase.from('areas').delete().eq('id', areaId);
        if (error) throw error;
        set((state) => ({ areas: state.areas.filter(a => a.id !== areaId) }));
      } else {
        set((state) => ({ areas: state.areas.filter(a => a.id !== areaId) }));
      }
    } catch (error) {
      console.error('Error removing area:', error);
    }
  },

  addCertificate: async (certificate) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('certificates').insert([certificate]).select().single();
        if (error) throw error;
        set((state) => ({ certificates: [data, ...state.certificates] }));
      } else {
        set((state) => ({ certificates: [{ ...certificate, id: `c${Date.now()}` }, ...state.certificates] }));
      }
    } catch (error) {
      console.error('Error adding certificate:', error);
    }
  },

  addPortfolioItem: async (item) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('portfolio').insert([item]).select().single();
        if (error) throw error;
        set((state) => ({ portfolio: [data, ...state.portfolio] }));
      } else {
        set((state) => ({ portfolio: [{ ...item, id: `p${Date.now()}` }, ...state.portfolio] }));
      }
    } catch (error) {
      console.error('Error adding portfolio item:', error);
    }
  },

  addRecommendation: async (recommendation) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('recommendations').insert([recommendation]).select().single();
        if (error) throw error;
        set((state) => ({ recommendations: [data, ...state.recommendations] }));
      } else {
        set((state) => ({ recommendations: [{ ...recommendation, id: `r${Date.now()}` }, ...state.recommendations] }));
      }
    } catch (error) {
      console.error('Error adding recommendation:', error);
    }
  },
}));
