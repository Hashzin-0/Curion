
/**
 * @fileOverview Gerenciamento de estado global com Zustand.
 * Centraliza a lógica de negócios e sincronização com o banco de dados seguindo o schema oficial.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DatabaseService } from './services/database';
import { detectAreaFromRole, getRelevantAreaSlugsForSkill, slugify } from './utils';

export type User = { 
  id: string; 
  username: string; 
  name: string; 
  avatar_path: string | null; 
  headline: string | null; 
  summary: string | null; 
  location: string | null; 
  availability_status?: 'searching' | 'open' | 'busy';
  email?: string; 
  phone?: string; 
  website?: string;
  audio_bio_path?: string | null;
  audio_bio_hash?: string | null;
};

export type ProfessionalArea = { 
  id: string; 
  user_id: string; 
  name: string; 
  theme_color: string; 
  order: number; 
};

export type Experience = { 
  id: string; 
  user_id: string; 
  area_id: string | null; 
  role: string; 
  company_name: string; 
  start_date: string | null; 
  end_date: string | null; 
  description: string | null; 
};

export type Education = { 
  id: string; 
  user_id: string; 
  institution: string; 
  course: string; 
  start_date: string | null; 
  end_date: string | null; 
};

export type PortfolioItem = { 
  id: string; 
  user_id: string; 
  title: string; 
  description: string | null; 
  file_path: string | null; 
  external_url: string | null; 
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  external_url: string | null;
};

export type Skill = { 
  id: string; 
  name: string; 
  icon: string; 
};

export type AreaSkill = { 
  area_id: string; 
  skill_id: string; 
};

interface AppState {
  currentUser: User | null;
  users: User[];
  areas: ProfessionalArea[];
  experiences: Experience[];
  skills: Skill[];
  areaSkills: AreaSkill[];
  education: Education[];
  portfolio: PortfolioItem[];
  projects: Project[];
  isLoading: boolean;
  isAuthReady: boolean;
  isAudioPlaying: boolean;
  
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  setIsAudioPlaying: (playing: boolean) => void;
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

  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  updatePortfolioItem: (item: PortfolioItem) => Promise<void>;
  removePortfolioItem: (id: string) => Promise<void>;

  addProject: (proj: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (proj: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  addAreaSkill: (as: AreaSkill) => Promise<void>;
  removeAreaSkill: (areaId: string, skillId: string) => Promise<void>;
  addSkillToRelevantAreas: (skillId: string, skillName: string) => Promise<void>;
  
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
      portfolio: [],
      projects: [],
      isLoading: true,
      isAuthReady: false,
      isAudioPlaying: false,
      
      setUser: (user) => set({ currentUser: user }),
      setAuthReady: (ready) => set({ isAuthReady: ready }),
      setIsAudioPlaying: (playing) => set({ isAudioPlaying: playing }),

      syncUserWithDatabase: async (userData) => {
        try {
          const existingUser = await DatabaseService.getUserById(userData.id!);
          
          let userRecord;
          if (existingUser) {
            userRecord = existingUser;
          } else {
            userRecord = await DatabaseService.syncUser(userData);
          }

          const contacts = await DatabaseService.fetchUserContacts(userRecord.id);
          const mergedUser = { 
            ...userRecord, 
            email: contacts?.email || userData.email, 
            phone: contacts?.phone || userData.phone,
            website: contacts?.website
          };
          
          set({ currentUser: mergedUser });
          return mergedUser;
        } catch (error) {
          console.error('Store: syncUserWithDatabase failed', error);
          throw error;
        }
      },

      updateUser: async (userData) => {
        const { currentUser } = get();
        if (!currentUser) return;
        const data = await DatabaseService.updateUser(currentUser.id, userData);
        
        if (userData.email || userData.phone || userData.website) {
          await DatabaseService.upsertUserContacts({
            user_id: currentUser.id,
            email: userData.email,
            phone: userData.phone,
            website: userData.website
          });
        }

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
            portfolio: results[6].data || [],
            projects: results[7].data || [],
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
        let area = get().areas.find(a => a.name.toLowerCase() === detected.name.toLowerCase() && a.user_id === exp.user_id);
        if (!area) {
          area = await DatabaseService.upsertArea({ 
            name: detected.name, 
            theme_color: detected.themeColor,
            user_id: exp.user_id,
            order: get().areas.length
          });
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
        set({ education: get().education.filter(e => e.id !== id) });
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

      addProject: async (proj) => {
        const data = await DatabaseService.upsertProject(proj);
        set(s => ({ projects: [data, ...s.projects] }));
      },
      updateProject: async (proj) => {
        const data = await DatabaseService.upsertProject(proj);
        set(s => ({ projects: s.projects.map(p => p.id === proj.id ? data : p) }));
      },
      removeProject: async (id) => {
        await DatabaseService.deleteProject(id);
        set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
      },

      addAreaSkill: async (as) => {
        await DatabaseService.addAreaSkill(as);
        set(s => ({ areaSkills: [...s.areaSkills, as] }));
      },

      removeAreaSkill: async (areaId, skillId) => {
        await DatabaseService.deleteAreaSkill(areaId, skillId);
        set(s => ({ areaSkills: s.areaSkills.filter(as => !(as.area_id === areaId && as.skill_id === skillId)) }));
      },

      addSkillToRelevantAreas: async (skillId, skillName) => {
        const { currentUser, areas, addAreaSkill } = get();
        if (!currentUser || areas.length === 0) return;
        
        const relevantSlugs = getRelevantAreaSlugsForSkill(skillName);
        const userAreasToLink = areas.filter(a => {
          const areaSlug = slugify(a.name);
          return relevantSlugs.includes(areaSlug) && a.user_id === currentUser.id;
        });

        const targetAreas = userAreasToLink.length > 0 ? userAreasToLink : [areas[0]];
        
        for (const area of targetAreas) {
          try {
            await addAreaSkill({ area_id: area.id, skill_id: skillId });
          } catch (e) {
            // Ignora duplicatas
          }
        }
      },
    }),
    { 
      name: 'curion-x-v4',
      partialize: (state) => ({ currentUser: state.currentUser }) // Apenas currentUser persiste
    }
  )
);
