
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

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: mockUsers,
  areas: [],
  experiences: [],
  skills: [],
  areaSkills: [],
  education: [],
  achievements: [],
  certificates: [],
  portfolio: [],
  recommendations: [],
  isLoading: true,
  isAuthReady: false,
  
  login: (username) => set((state) => ({ currentUser: state.users.find(u => u.username === username) || null })),
  logout: () => set({ currentUser: null }),
  setUser: (user) => set({ currentUser: user }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),

  syncUserWithDatabase: async (userData) => {
    if (!userData.id) return null;
    
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();

      if (existingUser) {
        set({ currentUser: existingUser });
        return existingUser;
      }

      let finalUsername = userData.username || 'user';
      const { data: usernameTaken } = await supabase
        .from('users')
        .select('id')
        .eq('username', finalUsername)
        .maybeSingle();

      if (usernameTaken) {
        finalUsername = `${finalUsername}-${userData.id.substring(0, 5)}`;
      }

      const newUser: User = {
        id: userData.id,
        username: finalUsername,
        name: userData.name || 'Usuário',
        photo_url: userData.photo_url || `https://picsum.photos/seed/${userData.id}/200/200`,
        headline: userData.headline || 'Profissional',
        summary: userData.summary || 'Bem-vindo ao meu perfil.',
        location: userData.location || 'Brasil',
      };

      const { data, error } = await supabase
        .from('users')
        .upsert(newUser, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        set({ currentUser: newUser });
        return newUser;
      }

      set({ currentUser: data });
      return data;
    } catch (err: any) {
      const fallbackUser: User = {
        id: userData.id,
        username: userData.username || 'user',
        name: userData.name || 'Usuário',
        photo_url: userData.photo_url || '',
        headline: 'Profissional',
        summary: '',
        location: '',
      };
      set({ currentUser: fallbackUser });
      return fallbackUser;
    }
  },

  updateUser: async (userData) => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', currentUser.id)
        .select()
        .single();
      if (error) throw error;
      set((state) => ({
        currentUser: data,
        users: state.users.map(u => u.id === data.id ? data : u),
      }));
    } catch (err: any) {
      console.error('Error updating user:', err.message || err);
      throw err;
    }
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
        users: (usersData && usersData.length > 0) ? [...usersData, ...mockUsers.filter(mu => !usersData.find(u => u.username === mu.username))] : mockUsers,
        areas: areasData || [],
        experiences: experiencesData || [],
        skills: skillsData || [],
        areaSkills: areaSkillsData || [],
        education: educationData || [],
        achievements: achievementsData || [],
        certificates: certificatesData || [],
        portfolio: portfolioData || [],
        recommendations: recommendationsData || [],
        isLoading: false
      });
    } catch (error: any) {
      console.error('Error fetching data:', error.message || error);
      set({ isLoading: false });
    }
  },

  addExperience: async (experience) => {
    const { data, error } = await supabase.from('experiences').insert([experience]).select().single();
    if (error) throw error;
    set((state) => ({ experiences: [data, ...state.experiences] }));
  },
  updateExperience: async (experience) => {
    const { data, error } = await supabase.from('experiences').update(experience).eq('id', experience.id).select().single();
    if (error) throw error;
    set((state) => ({ experiences: state.experiences.map(e => e.id === experience.id ? data : e) }));
  },
  removeExperience: async (id) => {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ experiences: state.experiences.filter(e => e.id !== id) }));
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
    
    if (!area) throw new Error('Não foi possível identificar ou criar a área de atuação.');
    await addExperience({ ...exp, area_id: area.id });
  },
  
  addEducation: async (education) => {
    const { data, error } = await supabase.from('education').insert([education]).select().single();
    if (error) throw error;
    set((state) => ({ education: [data, ...state.education] }));
  },
  updateEducation: async (education) => {
    const { data, error } = await supabase.from('education').update(education).eq('id', education.id).select().single();
    if (error) throw error;
    set((state) => ({ education: state.education.map(e => e.id === education.id ? data : e) }));
  },
  removeEducation: async (id) => {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ education: state.education.filter(e => e.id !== id) }));
  },
  
  addArea: async (area) => {
    const { data, error } = await supabase.from('areas').insert([area]).select().single();
    if (error) throw error;
    set((state) => ({ areas: [...state.areas, data] }));
  },
  updateArea: async (area) => {
    const { data, error } = await supabase.from('areas').update(area).eq('id', area.id).select().single();
    if (error) throw error;
    set((state) => ({ areas: state.areas.map(a => a.id === area.id ? data : a) }));
  },
  removeArea: async (areaId) => {
    const { error } = await supabase.from('areas').delete().eq('id', areaId);
    if (error) throw error;
    set((state) => ({ areas: state.areas.filter(a => a.id !== areaId) }));
  },
  
  addAchievement: async (achievement) => {
    const { data, error } = await supabase.from('achievements').insert([achievement]).select().single();
    if (error) throw error;
    set((state) => ({ achievements: [data, ...state.achievements] }));
  },
  updateAchievement: async (achievement) => {
    const { data, error } = await supabase.from('achievements').update(achievement).eq('id', achievement.id).select().single();
    if (error) throw error;
    set((state) => ({ achievements: state.achievements.map(a => a.id === achievement.id ? data : a) }));
  },
  removeAchievement: async (id) => {
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ achievements: state.achievements.filter(a => a.id !== id) }));
  },

  addCertificate: async (certificate) => {
    const { data, error } = await supabase.from('certificates').insert([certificate]).select().single();
    if (error) throw error;
    set((state) => ({ certificates: [data, ...state.certificates] }));
  },
  updateCertificate: async (certificate) => {
    const { data, error } = await supabase.from('certificates').update(certificate).eq('id', certificate.id).select().single();
    if (error) throw error;
    set((state) => ({ certificates: state.certificates.map(c => c.id === certificate.id ? data : c) }));
  },
  removeCertificate: async (id) => {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ certificates: state.certificates.filter(c => c.id !== id) }));
  },

  addPortfolioItem: async (item) => {
    const { data, error } = await supabase.from('portfolio').insert([item]).select().single();
    if (error) throw error;
    set((state) => ({ portfolio: [data, ...state.portfolio] }));
  },
  updatePortfolioItem: async (item) => {
    const { data, error } = await supabase.from('portfolio').update(item).eq('id', item.id).select().single();
    if (error) throw error;
    set((state) => ({ portfolio: state.portfolio.map(p => p.id === item.id ? data : p) }));
  },
  removePortfolioItem: async (id) => {
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ portfolio: state.portfolio.filter(p => p.id !== id) }));
  },

  addRecommendation: async (recommendation) => {
    const { data, error } = await supabase.from('recommendations').insert([recommendation]).select().single();
    if (error) throw error;
    set((state) => ({ recommendations: [data, ...state.recommendations] }));
  },
  updateRecommendation: async (recommendation) => {
    const { data, error } = await supabase.from('recommendations').update(recommendation).eq('id', recommendation.id).select().single();
    if (error) throw error;
    set((state) => ({ recommendations: state.recommendations.map(r => r.id === recommendation.id ? data : r) }));
  },
  removeRecommendation: async (id) => {
    const { error } = await supabase.from('recommendations').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ recommendations: state.recommendations.filter(r => r.id !== id) }));
  },
}));
