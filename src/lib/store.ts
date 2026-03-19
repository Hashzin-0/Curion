/**
 * @fileOverview Gerenciamento de estado global com Zustand.
 * Centraliza a lógica de negócios e sincronização com o banco de dados.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DatabaseService } from './services/database';
import { detectAreaFromRole, getRelevantAreaSlugsForSkill } from './utils';

export type User = { 
  id: string; 
  username: string; 
  name: string; 
  avatar_path: string; 
  headline: string; 
  summary: string; 
  location: string; 
  email?: string; 
  phone?: string; 
};

export type ProfessionalArea = { id: string; user_id: string; name: string; slug: string; icon: string; theme_color: string; };
export type Experience = { id: string; user_id: string; area_id: string; company_name: string; company_logo: string; role: string; start_date: string; end_date: string | null; description: string; };
export type Skill = { id: string; name: string; icon: string; };
export type AreaSkill = { id: string; area_id: string; skill_id: string; level: number; };
export type Education = { id: string; user_id: string; institution: string; course: string; start_date: string; end_date: string | null; };
export type Achievement = { id: string; user_id: string; title: string; organization: string; date: string; description: string; };
export type PortfolioItem = { id: string; user_id: string; title: string; description: string; file_url?: string; link_url?: string; };
export type Certificate = { id: string; user_id: string; name: string; issuer: string; date: string; url?: string; };

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
  isLoading: boolean;
  isAuthReady: boolean;
  
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  syncUserWithDatabase: (userData: Partial<User>) => Promise<User | null>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  
  addExperience: (exp: Omit<Experience, 'id'>) => Promise<void>;
  updateExperience: (exp: Experience) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;
  addExperienceWithAutoArea: (exp: Omit<Experience, 'id' | 'area_id'>) => Promise<void>;
  
  addArea: (area: Omit<ProfessionalArea, 'id' | 'user_id'>) => Promise<ProfessionalArea | void>;
  updateArea: (area: ProfessionalArea) => Promise<void>;
  removeArea: (id: string) => Promise<void>;

  addEducation: (edu: Omit<Education, 'id'>) => Promise<void>;
  updateEducation: (edu: Education) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;

  addAchievement: (ach: Omit<Achievement, 'id'>) => Promise<void>;
  updateAchievement: (ach: Achievement) => Promise<void>;
  removeAchievement: (id: string) => Promise<void>;

  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (item: PortfolioItem) => Promise<void>;
  removePortfolioItem: (id: string) => Promise<void>;

  addAreaSkill: (as: Omit<AreaSkill, 'id'>) => Promise<void>;
  addSkillToRelevantAreas: (skillId: string, skillName: string, level: number) => Promise<void>;
  removeAreaSkill: (id: string) => Promise<void>;
  
  fetchData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      areas: [],
      experiences: [],
      skills: [],
      areaSkills: [],
      education: [],
      achievements: [],
      certificates: [],
      portfolio: [],
      isLoading: true,
      isAuthReady: false,
      
      setUser: (user) => set({ currentUser: user }),
      setAuthReady: (ready) => set({ isAuthReady: ready }),

      syncUserWithDatabase: async (userData) => {
        try {
          const data = await DatabaseService.syncUser(userData);
          // O email e telefone vêm da sessão auth, não necessariamente do banco publico
          set({ currentUser: { ...data, email: userData.email, phone: userData.phone } });
          return data;
        } catch (error) {
          console.error('Store: syncUserWithDatabase failed', error);
          throw error;
        }
      },

      updateUser: async (userData) => {
        const { currentUser } = get();
        if (!currentUser) return;
        const data = await DatabaseService.updateUser(currentUser.id, userData);
        set({ currentUser: { ...currentUser, ...data } });
      },

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const results = await DatabaseService.fetchAllData();
          set({
            users: results[0].data || [],
            areas: results[1].data || [],
            experiences: results[2].data || [],
            skills: results[3].data || [],
            areaSkills: results[4].data || [],
            education: results[5].data || [],
            achievements: results[6].data || [],
            certificates: results[7].data || [],
            portfolio: results[8].data || [],
            isLoading: false
          });
        } catch (error) {
          console.error('Store: fetchData failed', error);
          set({ isLoading: false });
        }
      },

      addExperience: async (exp) => {
        const data = await DatabaseService.upsertExperience(exp);
        set((s) => ({ experiences: [data, ...s.experiences] }));
      },
      updateExperience: async (exp) => {
        const data = await DatabaseService.upsertExperience(exp);
        set((s) => ({ experiences: s.experiences.map(e => e.id === exp.id ? data : e) }));
      },
      removeExperience: async (id) => {
        await DatabaseService.deleteExperience(id);
        set((s) => ({ experiences: s.experiences.filter(e => e.id !== id) }));
      },
      addExperienceWithAutoArea: async (exp) => {
        const detected = detectAreaFromRole(exp.role);
        let area = get().areas.find(a => a.slug === detected.slug && a.user_id === exp.user_id);
        if (!area) {
          area = await DatabaseService.upsertArea({ ...detected, user_id: exp.user_id });
          set(s => ({ areas: [...s.areas, area!] }));
        }
        await get().addExperience({ ...exp, area_id: area!.id });
      },

      addArea: async (area) => {
        const { currentUser } = get();
        if (!currentUser) return;
        const data = await DatabaseService.upsertArea({ ...area, user_id: currentUser.id });
        set((s) => ({ areas: [...s.areas, data] }));
        return data;
      },
      updateArea: async (area) => {
        const data = await DatabaseService.upsertArea(area);
        set((s) => ({ areas: s.areas.map(a => a.id === area.id ? data : a) }));
      },
      removeArea: async (id) => {
        await DatabaseService.deleteArea(id);
        set((s) => ({ areas: s.areas.filter(a => a.id !== id) }));
      },

      addEducation: async (edu) => {
        const data = await DatabaseService.upsertEducation(edu);
        set(s => ({ education: [data, ...s.education] }));
      },
      updateEducation: async (edu) => {
        const data = await DatabaseService.upsertEducation(edu);
        set(s => ({ education: s.education.map(e => e.id === edu.id ? data : e) }));
      },
      removeEducation: async (id) => {
        await DatabaseService.deleteEducation(id);
        set(s => ({ education: s.education.filter(e => e.id !== id) }));
      },

      addAchievement: async (ach) => {
        const data = await DatabaseService.upsertAchievement(ach);
        set(s => ({ achievements: [data, ...s.achievements] }));
      },
      updateAchievement: async (ach) => {
        const data = await DatabaseService.upsertAchievement(ach);
        set(s => ({ achievements: s.achievements.map(a => a.id === ach.id ? data : a) }));
      },
      removeAchievement: async (id) => {
        await DatabaseService.deleteAchievement(id);
        set(s => ({ achievements: s.achievements.filter(a => a.id !== id) }));
      },

      addPortfolioItem: async (item) => {
        const data = await DatabaseService.upsertPortfolioItem(item);
        set(s => ({ portfolio: [data, ...s.portfolio] }));
      },
      updatePortfolioItem: async (item) => {
        const data = await DatabaseService.upsertPortfolioItem(item);
        set(s => ({ portfolio: s.portfolio.map(p => p.id === item.id ? data : p) }));
      },
      removePortfolioItem: async (id) => {
        await DatabaseService.deletePortfolioItem(id);
        set(s => ({ portfolio: s.portfolio.filter(p => p.id !== id) }));
      },

      addAreaSkill: async (as) => {
        const data = await DatabaseService.addAreaSkill(as);
        set(s => ({ areaSkills: [...s.areaSkills, data] }));
      },

      addSkillToRelevantAreas: async (skillId, skillName, level) => {
        const { areas, addArea, addAreaSkill, areaSkills } = get();
        let targetAreas = [...areas];
        if (targetAreas.length === 0) {
          const newArea = await addArea({
            name: 'Geral',
            slug: 'geral',
            icon: 'Briefcase',
            theme_color: '#334155'
          });
          if (newArea) targetAreas = [newArea];
        }

        const matchedSlugs = getRelevantAreaSlugsForSkill(skillName);
        let areasToLink = targetAreas.filter(a => matchedSlugs.includes(a.slug));

        if (areasToLink.length === 0) {
          areasToLink = targetAreas;
        }

        for (const area of areasToLink) {
          const alreadyHas = areaSkills.find(as => as.area_id === area.id && as.skill_id === skillId);
          if (!alreadyHas) {
            await addAreaSkill({
              area_id: area.id,
              skill_id: skillId,
              level: level
            });
          }
        }
      },

      removeAreaSkill: async (id) => {
        await DatabaseService.deleteAreaSkill(id);
        set(s => ({ areaSkills: s.areaSkills.filter(as => as.id !== id) }));
      },
    }),
    { name: 'career-canvas-src-v1' }
  )
);
