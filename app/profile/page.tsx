'use client';

import { useStore, User } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { generateProfessionalSummary } from '@/src/ai/flows/generate-summary-flow';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';

export default function Dashboard() {
  const { currentUser, areas, addArea, updateUser, isAuthReady, experiences, skills } = useStore();
  const router = useRouter();

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaIcon, setNewAreaIcon] = useState('Briefcase');
  const [newAreaTheme, setNewAreaTheme] = useState('blue');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<User>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  useEffect(() => {
    if (isAuthReady && !currentUser) router.push('/');
  }, [currentUser, isAuthReady, router]);

  useEffect(() => {
    if (currentUser) {
      setEditedProfile({
        name: currentUser.name,
        headline: currentUser.headline,
        summary: currentUser.summary,
        location: currentUser.location,
        photo_url: currentUser.photo_url,
      });
    }
  }, [currentUser]);

  const fetchTheme = useCallback(async () => {
    if (!currentUser) return;
    const cacheKey = `profile-theme-${currentUser.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setProfileTheme(JSON.parse(cached)); return; } catch {}
    }
    setIsLoadingTheme(true);
    try {
      const res = await fetch('/api/profile/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          headline: currentUser.headline,
          areas: areas.map(a => a.name),
        }),
      });
      if (res.ok) {
        const theme = await res.json();
        setProfileTheme(theme);
        localStorage.setItem(cacheKey, JSON.stringify(theme));
      }
    } catch (e) {
      console.error('Erro ao gerar tema:', e);
    } finally {
      setIsLoadingTheme(false);
    }
  }, [currentUser, areas]);

  useEffect(() => {
    if (isAuthReady && currentUser) fetchTheme();
  }, [isAuthReady, currentUser, fetchTheme]);

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;
    const slug = newAreaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    addArea({ name: newAreaName, slug, icon: newAreaIcon, theme_color: newAreaTheme });
    setIsAddingArea(false);
    setNewAreaName('');
    setNewAreaIcon('Briefcase');
    setNewAreaTheme('blue');
    // Invalidate cached theme so it regenerates with new areas
    if (currentUser) localStorage.removeItem(`profile-theme-${currentUser.id}`);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(editedProfile);
    setIsEditingProfile(false);
    // Invalidate cached theme so it regenerates with updated info
    if (currentUser) {
      localStorage.removeItem(`profile-theme-${currentUser.id}`);
      setProfileTheme(null);
      fetchTheme();
    }
  };

  const handleGenerateSummary = async () => {
    if (!currentUser) return;
    setIsGeneratingSummary(true);
    try {
      const userExps = experiences.filter(e => e.user_id === currentUser.id).map(e => `${e.role} na ${e.company_name}`);
      const userSkills = skills.map(s => s.name);
      const result = await generateProfessionalSummary({
        name: editedProfile.name || currentUser.name,
        headline: editedProfile.headline || currentUser.headline,
        experiences: userExps,
        skills: userSkills,
      });
      setEditedProfile(prev => ({ ...prev, summary: result.summary }));
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return null;

  const availableIcons = ['Briefcase', 'ChefHat', 'MessageSquare', 'Package', 'Code', 'PenTool', 'Camera', 'Music', 'HeartPulse'];
  const availableThemes = ['blue', 'emerald', 'orange', 'purple', 'rose', 'amber', 'cyan', 'indigo'];

  return (
    <>
      {/* Top action bar */}
      <div className="fixed top-4 left-4 z-20 flex items-center gap-2">
        <a
          href={`/${currentUser.username}`}
          className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm"
        >
          Ver Perfil Público
        </a>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
          className="px-4 py-2 bg-red-100/90 dark:bg-red-900/30 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-full text-sm font-bold border border-red-200 dark:border-red-800 hover:bg-red-200 transition-all shadow-sm"
        >
          Sair
        </button>
      </div>

      <ThemedProfileLayout
        user={currentUser}
        areas={areas}
        isOwner={true}
        onEditProfile={() => setIsEditingProfile(true)}
        onAddArea={() => setIsAddingArea(true)}
        theme={profileTheme}
        isLoadingTheme={isLoadingTheme}
        username={currentUser.username}
      />

      {/* ─── Edit Profile Modal ─── */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Perfil Profissional</h3>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <LucideIcons.X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={editedProfile.name || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Título (Headline)</label>
                    <input
                      type="text"
                      placeholder="Ex: Desenvolvedor Senior"
                      value={editedProfile.headline || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Localização</label>
                    <div className="relative">
                      <LucideIcons.MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editedProfile.location || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Foto de Perfil (URL)</label>
                    <div className="relative">
                      <LucideIcons.Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={editedProfile.photo_url || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, photo_url: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Resumo Profissional</label>
                    <button
                      type="button"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingSummary ? (
                        <LucideIcons.Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <LucideIcons.Sparkles className="w-3 h-3" />
                      )}
                      {isGeneratingSummary ? 'Gerando...' : 'Melhorar com IA'}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={editedProfile.summary || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, summary: e.target.value })}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    placeholder="Conte um pouco sobre sua trajetória profissional..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Add Area Modal ─── */}
      <AnimatePresence>
        {isAddingArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nova Área Profissional</h3>
                <button onClick={() => setIsAddingArea(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <LucideIcons.X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddArea} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome da Área</label>
                  <input
                    type="text"
                    required
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="Ex: Desenvolvedor Frontend"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ícone Representativo</label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map(iconName => {
                      // @ts-ignore
                      const Icon = LucideIcons[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewAreaIcon(iconName)}
                          className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                            newAreaIcon === iconName
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Paleta de Cor</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableThemes.map(themeColor => (
                      <button
                        key={themeColor}
                        type="button"
                        onClick={() => setNewAreaTheme(themeColor)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          newAreaTheme === themeColor
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-slate-900 dark:ring-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {themeColor}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Criar Área
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
