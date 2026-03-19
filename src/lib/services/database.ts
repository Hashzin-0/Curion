/**
 * @fileOverview Camada de serviço isolada para interações com o Supabase.
 * Centraliza toda a lógica de persistência de dados.
 */
import { supabase } from '../supabase';
import { User, ProfessionalArea, Experience, Education, Achievement, Certificate, PortfolioItem, AreaSkill } from '../store';

export type JobVacancy = {
  id: string;
  user_id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  salary?: string;
  contact_info: string;
  area_slug: string;
  file_url?: string;
  created_at: string;
};

export const DatabaseService = {
  // Usuário
  async syncUser(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  async updateUser(userId: string, userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  async fetchPublicProfiles() {
    const { data, error } = await supabase
      .from('users')
      .select('*, areas(*)');
    if (error) throw error;
    return data;
  },

  // Analytics de Visualizações
  async recordProfileView(userId: string) {
    const { error } = await supabase
      .from('profile_views')
      .insert([{ user_id: userId, viewed_at: new Date().toISOString() }]);
    if (error) console.warn('Falha ao registrar view:', error);
  },

  async fetchProfileStats(userId: string) {
    const { data, error } = await supabase
      .from('profile_views')
      .select('viewed_at')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // Vagas (Jobs)
  async fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as JobVacancy[];
    } catch (e) {
      console.warn('Tabela jobs pode não estar criada ainda:', e);
      return [];
    }
  },

  async createJob(job: Omit<JobVacancy, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single();
    if (error) throw error;
    return data as JobVacancy;
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

  // Áreas
  async upsertArea(area: Partial<ProfessionalArea>) {
    const { data, error } = await supabase.from('areas').upsert(area).select().single();
    if (error) throw error;
    return data as ProfessionalArea;
  },

  async deleteArea(id: string) {
    const { error } = await supabase.from('areas').delete().eq('id', id);
    if (error) throw error;
  },

  // Experiências
  async upsertExperience(exp: Partial<Experience>) {
    const { data, error } = await supabase.from('experiences').upsert(exp).select().single();
    if (error) throw error;
    return data as Experience;
  },

  async deleteExperience(id: string) {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) throw error;
  },

  // Educação
  async upsertEducation(edu: Partial<Education>) {
    const { data, error } = await supabase.from('education').upsert(edu).select().single();
    if (error) throw error;
    return data as Education;
  },

  async deleteEducation(id: string) {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) throw error;
  },

  // Portfólio
  async upsertPortfolioItem(item: Partial<PortfolioItem>) {
    const { data, error } = await supabase.from('portfolio').upsert(item).select().single();
    if (error) throw error;
    return data as PortfolioItem;
  },

  async deletePortfolioItem(id: string) {
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) throw error;
  },

  // Habilidades
  async addAreaSkill(skill: Omit<AreaSkill, 'id'>) {
    const { data, error } = await supabase.from('area_skills').insert([skill]).select().single();
    if (error) throw error;
    return data as AreaSkill;
  },

  async deleteAreaSkill(id: string) {
    const { error } = await supabase.from('area_skills').delete().eq('id', id);
    if (error) throw error;
  },

  // Carregamento Geral
  async fetchAllData() {
    const queries = [
      supabase.from('users').select('*'),
      supabase.from('areas').select('*'),
      supabase.from('experiences').select('*'),
      supabase.from('skills').select('*'),
      supabase.from('area_skills').select('*'),
      supabase.from('education').select('*'),
      supabase.from('achievements').select('*'),
      supabase.from('certificates').select('*'),
      supabase.from('portfolio').select('*'),
    ];
    return await Promise.all(queries);
  }
};
