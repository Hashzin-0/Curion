
/**
 * @fileOverview Camada de serviço isolada para interações com o Supabase.
 * Centraliza toda a lógica de persistência de dados.
 */
import { supabase } from '../supabase';
import { User, ProfessionalArea, Experience, Education, Achievement, Certificate, PortfolioItem, AreaSkill } from '../store';

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
    // Registra uma visualização de perfil
    const { error } = await supabase
      .from('profile_views')
      .insert([{ user_id: userId, viewed_at: new Date().toISOString() }]);
    // Não bloqueamos se falhar, apenas logamos
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

  // Conquistas
  async upsertAchievement(ach: Partial<Achievement>) {
    const { data, error } = await supabase.from('achievements').upsert(ach).select().single();
    if (error) throw error;
    return data as Achievement;
  },

  async deleteAchievement(id: string) {
    const { error } = await supabase.from('achievements').delete().eq('id', id);
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
