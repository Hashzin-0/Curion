
/**
 * @fileOverview Camada de serviço para interações com o Supabase seguindo o schema oficial.
 */
import { supabase } from '../supabase';
import { User, ProfessionalArea, Experience, Education, PortfolioItem, AreaSkill, Project } from '../store';

export type JobVacancy = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  description: string | null;
  requirements: string[] | null;
  location: string | null;
  salary: string | null;
  contact_info: string | null;
  area_slug: string | null;
  file_url: string | null;
  regime: string | null; // clt, pj, freelance, estagio
  work_model: string | null; // remoto, hibrido, presencial
  company_type: string | null; // startup, corporativo, agencia, pequena
  created_at: string;
};

export const DatabaseService = {
  // Usuário
  async syncUser(userData: Partial<User>) {
    const { id, username, name, headline, summary, avatar_path, location } = userData;
    const { data, error } = await supabase
      .from('users')
      .upsert({ id, username, name, headline, summary, avatar_path, location })
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as User | null;
  },

  async updateUser(userId: string, userData: Partial<User>) {
    const { username, name, headline, summary, avatar_path, location, availability_status } = userData;
    const { data, error } = await supabase
      .from('users')
      .update({ username, name, headline, summary, avatar_path, location, availability_status })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  async fetchPublicProfiles() {
    // Busca perfis incluindo áreas e habilidades (via area_skills)
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        professional_areas(
          *,
          area_skills(
            endorsements_count,
            skills(name)
          )
        )
      `);
    if (error) throw error;
    return data;
  },

  // Contatos do Usuário (Tabela user_contacts)
  async fetchUserContacts(userId: string) {
    const { data, error } = await supabase
      .from('user_contacts')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertUserContacts(contacts: any) {
    const { error } = await supabase
      .from('user_contacts')
      .upsert(contacts);
    if (error) throw error;
  },

  // Analytics (V2: Suporte a múltiplos eventos e metadados)
  async recordProfileView(userId: string, eventType: string = 'page_view', metadata: any = {}) {
    if (!userId) return;
    
    const enrichedMetadata = {
      ...metadata,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : 'direct',
      screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
      language: typeof window !== 'undefined' ? window.navigator.language : 'unknown'
    };

    let sessionId = '';
    if (typeof window !== 'undefined') {
      sessionId = sessionStorage.getItem('curion_session_id') || '';
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('curion_session_id', sessionId);
      }
    }

    const { error } = await supabase
      .from('page_views')
      .insert([{ 
        user_id: userId, 
        viewed_at: new Date().toISOString(),
        event_type: eventType,
        metadata: enrichedMetadata,
        session_id: sessionId || null
      }]);
    if (error) console.warn('DatabaseService: Erro ao gravar evento:', error.message);
  },

  async fetchProfileStats(userId: string) {
    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Vagas (Tabela jobs)
  async fetchJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('DatabaseService: Erro ao buscar vagas:', error.message);
      return [];
    }
    return data as JobVacancy[];
  },

  async createJob(job: Omit<JobVacancy, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select();
    
    if (error) {
      console.error('Erro detalhado no Supabase:', error);
      throw error;
    }
    
    return (data ? data[0] : null) as JobVacancy;
  },

  async uploadJobFile(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `jobs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('job-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('job-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Áreas Profissionais (Tabela professional_areas)
  async upsertArea(area: Partial<ProfessionalArea>) {
    const { data, error } = await supabase.from('professional_areas').upsert(area).select().single();
    if (error) throw error;
    return data as ProfessionalArea;
  },

  async deleteArea(id: string) {
    const { error } = await supabase.from('professional_areas').delete().eq('id', id);
    if (error) throw error;
  },

  // Experiências (Tabela experiences)
  async upsertExperience(exp: Partial<Experience>) {
    const { data, error } = await supabase.from('experiences').upsert(exp).select().single();
    if (error) throw error;
    return data as Experience;
  },

  async deleteExperience(id: string) {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) throw error;
  },

  // Educação (Tabela education)
  async upsertEducation(edu: Partial<Education>) {
    const { data, error } = await supabase.from('education').upsert(edu).select().single();
    if (error) throw error;
    return data as Education;
  },

  async deleteEducation(id: string) {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) throw error;
  },

  // Portfólio (Tabela portfolio_items)
  async upsertPortfolioItem(item: Partial<PortfolioItem>) {
    const { data, error } = await supabase.from('portfolio_items').upsert(item).select().single();
    if (error) throw error;
    return data as PortfolioItem;
  },

  async deletePortfolioItem(id: string) {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) throw error;
  },

  // Projetos (Tabela projects)
  async upsertProject(proj: Partial<Project>) {
    const { data, error } = await supabase.from('projects').upsert(proj).select().single();
    if (error) throw error;
    return data as Project;
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Habilidades (Tabelas skills e area_skills)
  async addAreaSkill(as: AreaSkill) {
    const { error } = await supabase.from('area_skills').insert([as]);
    if (error) throw error;
  },

  async deleteAreaSkill(areaId: string, skillId: string) {
    const { error } = await supabase.from('area_skills').delete().match({ area_id: areaId, skill_id: skillId });
    if (error) throw error;
  },

  // Carregamento Geral
  async fetchAllData() {
    const queries = [
      supabase.from('users').select('*'),
      supabase.from('professional_areas').select('*').order('order', { ascending: true }),
      supabase.from('experiences').select('*'),
      supabase.from('skills').select('*'),
      supabase.from('area_skills').select('*'),
      supabase.from('education').select('*'),
      supabase.from('portfolio_items').select('*'),
      supabase.from('projects').select('*'),
    ];
    return await Promise.all(queries);
  }
};
