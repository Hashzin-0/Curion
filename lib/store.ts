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
  level: number;
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
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  syncUserWithDatabase: (userData: Partial<User>) => Promise<User | null>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  
  addExperience: (experience: Omit<Experience, 'id'>) => Promise<void>;
  updateExperience: (experience: Experience) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  addExperienceWithAutoArea: (exp: Omit<Experience, 'id' | 'area_id'>) => Promise<void>;
  
  addEducation: (education: Omit<Education, 'id'>) => Promise<void>;
  updateEducation: (education: Education) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;
  
  addAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<void>;
  updateAchievement: (achievement: Achievement) => Promise<void>;
  removeAchievement: (id: string) => Promise<void>;
  
  addCertificate: (certificate: Omit<Certificate, 'id'>) => Promise<void>;
  updateCertificate: (certificate: Certificate) => Promise<void>;
  removeCertificate: (id: string) => Promise<void>;
  
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (item: PortfolioItem) => Promise<void>;
  removePortfolioItem: (id: string) => Promise<void>;
  
  addRecommendation: (recommendation: Omit<RecommendationLetter, 'id'>) => Promise<void>;
  updateRecommendation: (recommendation: RecommendationLetter) => Promise<void>;
  removeRecommendation: (id: string) => Promise<void>;
  
  addArea: (area: Omit<ProfessionalArea, 'id'>) => Promise<void>;
  updateArea: (area: ProfessionalArea) => Promise<void>;
  removeArea: (areaId: string) => Promise<void>;
  
  fetchData: () => Promise<void>;
}

const mockUser: User = {
  id: 'kardec-demo-id',
  username: 'kardec',
  name: 'Allan Kardec',
  photo_url: 'https://picsum.photos/seed/kardec/400/400',
  headline: 'Desenvolvedor Full Stack | Chef de Cozinha | Designer Gráfico',
  summary: 'Profissional multidisciplinar com paixão por tecnologia, gastronomia e artes visuais. Acredito que a criatividade é o elo que une todas as minhas áreas de atuação.',
  location: 'São Paulo, SP',
};

const mockAreas: ProfessionalArea[] = [
  { id: 'area-tech', name: 'Tecnologia', slug: 'tecnologia', icon: 'Code2', theme_color: '#3b82f6' },
  { id: 'area-gastro', name: 'Gastronomia', slug: 'gastronomia', icon: 'ChefHat', theme_color: '#f97316' },
  { id: 'area-design', name: 'Design & Marketing', slug: 'design', icon: 'Palette', theme_color: '#7c3aed' },
];

const mockExperiences: Experience[] = [
  {
    id: 'exp-1',
    user_id: mockUser.id,
    area_id: 'area-tech',
    company_name: 'TechInova Solutions',
    company_logo: 'https://picsum.photos/seed/tech/100/100',
    role: 'Desenvolvedor Full Stack Senior',
    start_date: '2021-01-15',
    end_date: null,
    description: 'Liderança técnica em projetos de larga escala utilizando React, Next.js e Node.js. Implementação de arquiteturas serverless e microserviços.',
  },
  {
    id: 'exp-2',
    user_id: mockUser.id,
    area_id: 'area-gastro',
    company_name: 'Restaurante Sabor & Arte',
    company_logo: 'https://picsum.photos/seed/food/100/100',
    role: 'Sous Chef de Cozinha',
    start_date: '2018-05-10',
    end_date: '2020-12-20',
    description: 'Gestão de praça, criação de menus sazonais e controle de qualidade de insumos. Especialista em cozinha mediterrânea.',
  },
  {
    id: 'exp-3',
    user_id: mockUser.id,
    area_id: 'area-design',
    company_name: 'Studio Criativo Freelance',
    company_logo: 'https://picsum.photos/seed/art/100/100',
    role: 'Designer Gráfico Pleno',
    start_date: '2016-02-01',
    end_date: '2018-04-30',
    description: 'Desenvolvimento de identidades visuais impactantes para startups e marcas de lifestyle. Criação de campanhas para redes sociais.',
  },
];

const mockEducation: Education[] = [
  { id: 'edu-1', user_id: mockUser.id, institution: 'USP - Universidade de São Paulo', course: 'Ciência da Computação', start_date: '2012-02-01', end_date: '2016-12-15' },
  { id: 'edu-2', user_id: mockUser.id, institution: 'Le Cordon Bleu', course: 'Diplôme de Cuisine', start_date: '2017-01-10', end_date: '2017-12-20' },
];

const mockSkills: Skill[] = [
  { id: 'skill-1', name: 'TypeScript', icon: 'Code2' },
  { id: 'skill-2', name: 'Gastronomia Molecular', icon: 'ChefHat' },
  { id: 'skill-3', name: 'Branding', icon: 'Palette' },
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [mockUser],
  areas: mockAreas,
  experiences: mockExperiences,
  skills: mockSkills,
  areaSkills: [],
  education: mockEducation,
  achievements: [],
  certificates: [],
  portfolio: [],
  recommendations: [],
  isLoading: true,
  isAuthReady: false,
  
  setUser: (user) => set({ currentUser: user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),

  syncUserWithDatabase: async (userData) => {
    if (!userData.id) return null;
    try {
      const { data: existingUser } = await supabase.from('users').select('*').eq('id', userData.id).maybeSingle();
      if (existingUser) {
        set({ currentUser: existingUser });
        return existingUser;
      }
      const newUser: User = {
        id: userData.id,
        username: userData.username || 'user',
        name: userData.name || 'Usuário',
        photo_url: userData.photo_url || `https://picsum.photos/seed/${userData.id}/400/400`,
        headline: userData.headline || 'Profissional',
        summary: userData.summary || 'Bem-vindo ao meu perfil.',
        location: userData.location || 'Brasil',
      };
      const { data } = await supabase.from('users').upsert(newUser).select().single();
      set({ currentUser: data || newUser });
      return data || newUser;
    } catch (err) {
      return null;
    }
  },

  updateUser: async (userData) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const { data } = await supabase.from('users').update(userData).eq('id', currentUser.id).select().single();
    if (data) set({ currentUser: data });
  },
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [
        { data: usersData },
        { data: areasData },
        { data: experiencesData },
        { data: skillsData },
        { data: areaSkillsData },
        { data: educationData },
        { data: achievementsData },
        { data: certificatesData },
        { data: portfolioData },
        { data: recommendationsData }
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
        users: (usersData && usersData.length > 0) ? [...usersData, mockUser] : [mockUser],
        areas: (areasData && areasData.length > 0) ? areasData : mockAreas,
        experiences: (experiencesData && experiencesData.length > 0) ? experiencesData : mockExperiences,
        skills: (skillsData && skillsData.length > 0) ? skillsData : mockSkills,
        areaSkills: areaSkillsData || [],
        education: (educationData && educationData.length > 0) ? educationData : mockEducation,
        achievements: achievementsData || [],
        certificates: certificatesData || [],
        portfolio: portfolioData || [],
        recommendations: recommendationsData || [],
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addExperience: async (exp) => {
    const { data } = await supabase.from('experiences').insert([exp]).select().single();
    if (data) set((state) => ({ experiences: [data, ...state.experiences] }));
  },
  updateExperience: async (exp) => {
    const { data } = await supabase.from('experiences').update(exp).eq('id', exp.id).select().single();
    if (data) set((state) => ({ experiences: state.experiences.map(e => e.id === exp.id ? data : e) }));
  },
  removeExperience: async (id) => {
    await supabase.from('experiences').delete().eq('id', id);
    set((state) => ({ experiences: state.experiences.filter(e => e.id !== id) }));
  },
  addExperienceWithAutoArea: async (exp) => {
    const { areas, addArea, addExperience } = get();
    const detected = detectAreaFromRole(exp.role);
    let area = areas.find(a => a.slug === detected.slug);
    if (!area) {
      await addArea({ name: detected.name, slug: detected.slug, icon: detected.icon, theme_color: detected.themeColor });
      area = get().areas.find(a => a.slug === detected.slug);
    }
    if (area) await addExperience({ ...exp, area_id: area.id });
  },
  
  addEducation: async (edu) => {
    const { data } = await supabase.from('education').insert([edu]).select().single();
    if (data) set((state) => ({ education: [data, ...state.education] }));
  },
  updateEducation: async (edu) => {
    const { data } = await supabase.from('education').update(edu).eq('id', edu.id).select().single();
    if (data) set((state) => ({ education: state.education.map(e => e.id === edu.id ? data : e) }));
  },
  removeEducation: async (id) => {
    await supabase.from('education').delete().eq('id', id);
    set((state) => ({ education: state.education.filter(e => e.id !== id) }));
  },
  
  addArea: async (area) => {
    const { data } = await supabase.from('areas').insert([area]).select().single();
    if (data) set((state) => ({ areas: [...state.areas, data] }));
  },
  updateArea: async (area) => {
    const { data } = await supabase.from('areas').update(area).eq('id', area.id).select().single();
    if (data) set((state) => ({ areas: state.areas.map(a => a.id === area.id ? data : a) }));
  },
  removeArea: async (id) => {
    await supabase.from('areas').delete().eq('id', id);
    set((state) => ({ areas: state.areas.filter(a => a.id !== id) }));
  },
  
  addAchievement: async (ach) => {
    const { data } = await supabase.from('achievements').insert([ach]).select().single();
    if (data) set((state) => ({ achievements: [data, ...state.achievements] }));
  },
  updateAchievement: async (ach) => {
    const { data } = await supabase.from('achievements').update(ach).eq('id', ach.id).select().single();
    if (data) set((state) => ({ achievements: state.achievements.map(a => a.id === ach.id ? data : a) }));
  },
  removeAchievement: async (id) => {
    await supabase.from('achievements').delete().eq('id', id);
    set((state) => ({ achievements: state.achievements.filter(a => a.id !== id) }));
  },

  addCertificate: async (cert) => {
    const { data } = await supabase.from('certificates').insert([cert]).select().single();
    if (data) set((state) => ({ certificates: [data, ...state.certificates] }));
  },
  updateCertificate: async (cert) => {
    const { data } = await supabase.from('certificates').update(cert).eq('id', cert.id).select().single();
    if (data) set((state) => ({ certificates: state.certificates.map(c => c.id === cert.id ? data : c) }));
  },
  removeCertificate: async (id) => {
    await supabase.from('certificates').delete().eq('id', id);
    set((state) => ({ certificates: state.certificates.filter(c => c.id !== id) }));
  },

  addPortfolioItem: async (item) => {
    const { data } = await supabase.from('portfolio').insert([item]).select().single();
    if (data) set((state) => ({ portfolio: [data, ...state.portfolio] }));
  },
  updatePortfolioItem: async (item) => {
    const { data } = await supabase.from('portfolio').update(item).eq('id', item.id).select().single();
    if (data) set((state) => ({ portfolio: state.portfolio.map(p => p.id === item.id ? data : p) }));
  },
  removePortfolioItem: async (id) => {
    await supabase.from('portfolio').delete().eq('id', id);
    set((state) => ({ portfolio: state.portfolio.filter(p => p.id !== id) }));
  },

  addRecommendation: async (rec) => {
    const { data } = await supabase.from('recommendations').insert([rec]).select().single();
    if (data) set((state) => ({ recommendations: [data, ...state.recommendations] }));
  },
  updateRecommendation: async (rec) => {
    const { data } = await supabase.from('recommendations').update(rec).eq('id', rec.id).select().single();
    if (data) set((state) => ({ recommendations: state.recommendations.map(r => r.id === rec.id ? data : r) }));
  },
  removeRecommendation: async (id) => {
    await supabase.from('recommendations').delete().eq('id', id);
    set((state) => ({ recommendations: state.recommendations.filter(r => r.id !== id) }));
  },
}));
