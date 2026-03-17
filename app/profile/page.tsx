
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, User, ProfessionalArea, Education, PortfolioItem, Certificate, Skill } from '@/lib/store';
import * as LucideIcons from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { generateProfessionalSummary } from '@/src/ai/flows/generate-summary-flow';
import { ProfileTheme } from '@/src/ai/flows/generate-profile-theme-flow';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';
import { AddContentModal } from '@/components/AddContentModal';
import { PhotoCropModal } from '@/components/PhotoCropModal';
import { RichEditor } from '@/components/RichEditor';
import { SkillSearch } from '@/components/SkillSearch';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

export default function Dashboard() {
  const { 
    currentUser, areas, updateUser, isAuthReady, experiences, skills, 
    updateArea, removeArea, isLoading, education, portfolio, certificates,
    updateEducation, removeEducation, updatePortfolioItem, removePortfolioItem,
    updateCertificate, removeCertificate, addAreaSkill, removeAreaSkill, areaSkills
  } = useStore();
  const router = useRouter();

  // Estados para edição/exclusão de áreas
  const [editingArea, setEditingArea] = useState<ProfessionalArea | null>(null);
  const [areaForm, setAreaForm] = useState<Partial<ProfessionalArea>>({});
  const [deletingArea, setDeletingArea] = useState<ProfessionalArea | null>(null);
  
  // Estados para edição de novos tipos de conteúdo
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingPort, setEditingPort] = useState<PortfolioItem | null>(null);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para perfil
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isManagingSkills, setIsManagingSkills] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState(80);

  const [editedProfile, setEditedProfile] = useState<Partial<User>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para Foto
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
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
      if (areas.length > 0) setSelectedAreaId(areas[0].id);
    }
  }, [currentUser, areas]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

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
    toast.success('Perfil atualizado com sucesso!');
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
      toast.info('Resumo gerado pela IA!');
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao gerar resumo com IA.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const copyProfileLink = () => {
    if (!currentUser) return;
    const url = `${window.location.origin}/${currentUser.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copiado!');
  };

  const handleAddSkill = async (skill: Skill) => {
    if (!selectedAreaId) {
      toast.error('Selecione uma área para vincular a habilidade.');
      return;
    }
    const exists = areaSkills.find(as => as.area_id === selectedAreaId && as.skill_id === skill.id);
    if (exists) {
      toast.warning('Esta habilidade já está vinculada a esta área.');
      return;
    }
    await addAreaSkill({
      area_id: selectedAreaId,
      skill_id: skill.id,
      level: skillLevel
    });
    toast.success(`${skill.name} adicionada!`);
  };

  // Handlers de Edição Genéricos
  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;
    setIsProcessing(true);
    await updateEducation(editingEdu);
    setIsProcessing(false);
    setEditingEdu(null);
    toast.success('Formação atualizada!');
  };

  const handleSavePort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPort) return;
    setIsProcessing(true);
    await updatePortfolioItem(editingPort);
    setIsProcessing(false);
    setEditingPort(null);
    toast.success('Item do portfólio atualizado!');
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setIsProcessing(true);
    await updateCertificate(editingCert);
    setIsProcessing(false);
    setEditingCert(null);
    toast.success('Certificado atualizado!');
  };

  const handleSaveArea = async () => {
    if (!editingArea || !areaForm.name || !areaForm.slug) return;
    setIsProcessing(true);
    await updateArea({ ...editingArea, ...areaForm } as ProfessionalArea);
    setIsProcessing(false);
    setEditingArea(null);
    toast.success('Área atualizada!');
  };

  const handleDeleteArea = async () => {
    if (!deletingArea) return;
    setIsProcessing(true);
    await removeArea(deletingArea.id);
    setIsProcessing(false);
    setDeletingArea(null);
    toast.success('Área removida.');
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

  const inputCls = "w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium";
  const labelCls = "block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2";

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
          onClick={copyProfileLink}
          className={`px-4 py-2 backdrop-blur-sm rounded-full text-sm font-bold border transition-all shadow-sm flex items-center gap-2 ${
            copied 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-white'
          }`}
        >
          {copied ? <LucideIcons.Check className="w-4 h-4" /> : <LucideIcons.Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar Link'}
        </button>
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
        education={education.filter(e => e.user_id === currentUser.id)}
        portfolio={portfolio.filter(p => p.user_id === currentUser.id)}
        certificates={certificates.filter(c => c.user_id === currentUser.id)}
        isOwner={true}
        onEditProfile={() => setIsEditingProfile(true)}
        onAddContent={() => setIsAddingContent(true)}
        onEditArea={(area) => { setEditingArea(area); setAreaForm(area); }}
        onDeleteArea={setDeletingArea}
        onEditEducation={setEditingEdu}
        onDeleteEducation={removeEducation}
        onEditPortfolio={setEditingPort}
        onDeletePortfolio={removePortfolioItem}
        onEditCertificate={setEditingCert}
        onDeleteCertificate={removeCertificate}
        onManageSkills={() => setIsManagingSkills(true)}
        theme={profileTheme}
        isLoadingTheme={isLoadingTheme}
        username={currentUser.username}
      />

      <AddContentModal isOpen={isAddingContent} onClose={() => setIsAddingContent(false)} />

      {rawImage && (
        <PhotoCropModal
          image={rawImage}
          isOpen={isCropOpen}
          onClose={() => { setIsCropOpen(false); setRawImage(null); }}
          onCropComplete={(cropped) => setEditedProfile({ ...editedProfile, photo_url: cropped })}
        />
      )}

      {/* MODAL EDITAR PERFIL */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Editar Perfil</h3>
                <button onClick={() => setIsEditingProfile(false)} className="p-2 text-slate-400 hover:text-slate-600"><LucideIcons.X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input {...getInputProps()} />
                  {editedProfile.photo_url ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img src={editedProfile.photo_url} alt="profile" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <LucideIcons.Camera size={40} className="text-slate-400" />
                  )}
                  <p className="text-sm font-bold text-slate-500">Arraste uma foto ou clique para alterar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-bold mb-2">Nome</label><input type="text" value={editedProfile.name || ''} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" /></div>
                  <div><label className="block text-sm font-bold mb-2">Headline</label><input type="text" value={editedProfile.headline || ''} onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" /></div>
                </div>
                <div><label className="block text-sm font-bold mb-2">Localização</label><input type="text" value={editedProfile.location || ''} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" /></div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold">Resumo Profissional</label>
                    <button type="button" onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      {isGeneratingSummary ? <LucideIcons.Loader2 className="w-3 h-3 animate-spin" /> : <LucideIcons.Sparkles className="w-3 h-3" />}
                      Melhorar com IA
                    </button>
                  </div>
                  <RichEditor content={editedProfile.summary || ''} onChange={(val) => setEditedProfile({ ...editedProfile, summary: val })} placeholder="Fale um pouco sobre sua trajetória..." />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl">Salvar Perfil</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL GERENCIAR HABILIDADES */}
      <AnimatePresence>
        {isManagingSkills && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Habilidades & Competências</h3>
                <button onClick={() => setIsManagingSkills(false)} className="p-2 text-slate-400 hover:text-slate-600"><LucideIcons.X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Vincular à Área</label>
                    <select 
                      value={selectedAreaId} 
                      onChange={(e) => setSelectedAreaId(e.target.value)}
                      className={inputCls}
                    >
                      {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Nível de Domínio ({skillLevel}%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(Number(e.target.value))}
                      className="w-full h-12 accent-blue-600"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className={labelCls}>Buscar Habilidade</label>
                  <SkillSearch onAdd={handleAddSkill} />
                </div>

                <div>
                  <label className={labelCls}>Suas Habilidades Atuais</label>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {areaSkills.map((as) => {
                      const skill = skills.find(s => s.id === as.skill_id);
                      const area = areas.find(a => a.id === as.area_id);
                      if (!skill) return null;
                      return (
                        <div key={as.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{skill.name}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">{area?.name || 'Geral'}</span>
                          <button onClick={() => removeAreaSkill(as.id)} className="text-red-500 hover:scale-110 transition-transform"><LucideIcons.X size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={() => setIsManagingSkills(false)} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold">Concluído</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAIS DE EDIÇÃO DE CONTEÚDO */}
      <AnimatePresence>
        {editingEdu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form onSubmit={handleSaveEdu} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6">Editar Formação</h3>
              <div className="space-y-4">
                <div><label className={labelCls}>Instituição</label><input required value={editingEdu.institution} onChange={e => setEditingEdu({...editingEdu, institution: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Curso</label><input required value={editingEdu.course} onChange={e => setEditingEdu({...editingEdu, course: e.target.value})} className={inputCls} /></div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingEdu(null)} className="flex-1 py-3 border rounded-xl font-bold">Cancelar</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">{isProcessing ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}

        {editingPort && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form onSubmit={handleSavePort} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6">Editar Projeto</h3>
              <div className="space-y-4">
                <div><label className={labelCls}>Título</label><input required value={editingPort.title} onChange={e => setEditingPort({...editingPort, title: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Descrição</label><textarea required value={editingPort.description} onChange={e => setEditingPort({...editingPort, description: e.target.value})} className={inputCls + " h-32"} /></div>
                <div><label className={labelCls}>Link (Opcional)</label><input value={editingPort.link_url || ''} onChange={e => setEditingPort({...editingPort, link_url: e.target.value})} className={inputCls} /></div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingPort(null)} className="flex-1 py-3 border rounded-xl font-bold">Cancelar</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold">{isProcessing ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}

        {editingCert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.form onSubmit={handleSaveCert} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="text-xl font-black mb-6">Editar Certificado</h3>
              <div className="space-y-4">
                <div><label className={labelCls}>Título</label><input required value={editingCert.title} onChange={e => setEditingCert({...editingCert, title: e.target.value})} className={inputCls} /></div>
                <div><label className={labelCls}>Instituição</label><input required value={editingCert.institution} onChange={e => setEditingCert({...editingCert, institution: e.target.value})} className={inputCls} /></div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingCert(null)} className="flex-1 py-3 border rounded-xl font-bold">Cancelar</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">{isProcessing ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}

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
                  <button onClick={handleSaveArea} disabled={isProcessing} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                    {isProcessing ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <button onClick={handleDeleteArea} disabled={isProcessing} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50">
                  {isProcessing ? 'Removendo...' : 'Sim, Remover'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
