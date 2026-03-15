'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, User, ProfessionalArea } from '@/lib/store';
import * as LucideIcons from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { generateProfessionalSummary } from '@/src/ai/flows/generate-summary-flow';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';
import { AddContentModal } from '@/components/AddContentModal';

export default function Dashboard() {
  const { currentUser, areas, updateUser, isAuthReady, experiences, skills, updateArea, removeArea, isLoading } = useStore();
  const router = useRouter();

  // Estados para edição/exclusão de áreas
  const [editingArea, setEditingArea] = useState<ProfessionalArea | null>(null);
  const [areaForm, setAreaForm] = useState<Partial<ProfessionalArea>>({});
  const [deletingArea, setDeletingArea] = useState<ProfessionalArea | null>(null);
  const [isProcessingArea, setIsProcessingArea] = useState(false);

  // Estados para perfil
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<User>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  useEffect(() => {
    // Só redireciona se a autenticação já foi verificada e o usuário definitivamente não existe
    if (isAuthReady && !currentUser && !isLoading) {
      router.push('/');
    }
  }, [currentUser, isAuthReady, isLoading, router]);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(editedProfile);
    setIsEditingProfile(false);
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

  // Handlers para áreas
  const handleEditArea = (area: ProfessionalArea) => {
    setEditingArea(area);
    setAreaForm({ ...area });
  };
  const handleSaveArea = async () => {
    if (!editingArea || !areaForm.name || !areaForm.slug) return;
    setIsProcessingArea(true);
    await updateArea({ ...editingArea, ...areaForm } as ProfessionalArea);
    setIsProcessingArea(false);
    setEditingArea(null);
  };
  const handleDeleteArea = async () => {
    if (!deletingArea) return;
    setIsProcessingArea(true);
    await removeArea(deletingArea.id);
    setIsProcessingArea(false);
    setDeletingArea(null);
  };

  if (!isAuthReady || (isLoading && !currentUser)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <LucideIcons.Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Autenticando...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <>
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
        onAddContent={() => setIsAddingContent(true)}
        theme={profileTheme}
        isLoadingTheme={isLoadingTheme}
        username={currentUser.username}
      />

      {/* Gerenciamento de Áreas */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <LucideIcons.Settings className="w-5 h-5 text-blue-500" />
            Configurações das Áreas
          </h2>
          <div className="space-y-4">
            {areas.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Nenhuma área cadastrada. Elas serão criadas automaticamente ao adicionar experiências.</p>
            ) : (
              areas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: area.theme_color }}>
                      {/* @ts-ignore */}
                      {LucideIcons[area.icon] ? (
                        (() => {
                          const Icon = (LucideIcons as any)[area.icon];
                          return <Icon className="w-5 h-5" />;
                        })()
                      ) : (
                        <LucideIcons.Briefcase className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{area.name}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest">{area.slug}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditArea(area)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <LucideIcons.Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingArea(area)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <LucideIcons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddContentModal isOpen={isAddingContent} onClose={() => setIsAddingContent(false)} />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Editar Perfil</h3>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 text-slate-400 hover:text-slate-600"><LucideIcons.X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold mb-2">Nome</label><input type="text" value={editedProfile.name || ''} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" /></div>
                  <div><label className="block text-sm font-bold mb-2">Headline</label><input type="text" value={editedProfile.headline || ''} onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" /></div>
                </div>
                <div><label className="block text-sm font-bold mb-2">Localização</label><input type="text" value={editedProfile.location || ''} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" /></div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold">Resumo Profissional</label>
                    <button type="button" onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="text-xs font-bold text-blue-600 flex items-center gap-1">{isGeneratingSummary ? <LucideIcons.Loader2 className="w-3 h-3 animate-spin" /> : <LucideIcons.Sparkles className="w-3 h-3" />} Melhorar com IA</button>
                  </div>
                  <textarea rows={4} value={editedProfile.summary || ''} onChange={(e) => setEditedProfile({ ...editedProfile, summary: e.target.value })} className="w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 border rounded-xl font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">Salvar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Area Modal */}
      <AnimatePresence>
        {editingArea && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white">Editar Área</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Área</label>
                  <input value={areaForm.name || ''} onChange={e => setAreaForm({ ...areaForm, name: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cor Temática (Hex)</label>
                  <div className="flex gap-2">
                    <input type="color" value={areaForm.theme_color || '#3b82f6'} onChange={e => setAreaForm({ ...areaForm, theme_color: e.target.value })} className="h-12 w-12 rounded-lg cursor-pointer" />
                    <input value={areaForm.theme_color || ''} onChange={e => setAreaForm({ ...areaForm, theme_color: e.target.value })} className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button onClick={() => setEditingArea(null)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-500">Cancelar</button>
                  <button onClick={handleSaveArea} disabled={isProcessingArea} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                    {isProcessingArea ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Area Modal */}
      <AnimatePresence>
        {deletingArea && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideIcons.Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Remover Área</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Tem certeza que deseja remover a área <strong>{deletingArea.name}</strong>? Todas as experiências associadas serão mantidas, mas a área sumirá.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingArea(null)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-500">Cancelar</button>
                <button onClick={handleDeleteArea} disabled={isProcessingArea} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50">
                  {isProcessingArea ? 'Removendo...' : 'Sim, Remover'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
