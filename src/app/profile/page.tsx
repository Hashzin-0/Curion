
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, User, ProfessionalArea, Education, PortfolioItem, Experience } from '@/lib/store';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateProfessionalSummary } from '@/ai/flows/generate-summary-flow';
import { ProfileTheme } from '@/ai/flows/generate-profile-theme-flow';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';
import { AddContentModal } from '@/components/AddContentModal';
import { PhotoCropModal } from '@/components/PhotoCropModal';
import { RichEditor } from '@/components/RichEditor';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Modal, Button, inputCls, labelCls } from '@/components/ui/SharedUI';
import { cn, calcDuration } from '@/lib/utils';

export default function Dashboard() {
  const { 
    currentUser, areas, updateUser, isAuthReady, experiences, skills, 
    updateArea, removeArea, isLoading, education, portfolio,
    updateEducation, removeEducation, updatePortfolioItem, removePortfolioItem,
    updateExperience, removeExperience,
    areaSkills
  } = useStore();
  const router = useRouter();

  const [editingArea, setEditingArea] = useState<ProfessionalArea | null>(null);
  const [areaForm, setAreaForm] = useState<Partial<ProfessionalArea>>({});
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [editingPort, setEditingPort] = useState<PortfolioItem | null>(null);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<User>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [profileTheme, setProfileTheme] = useState<ProfileTheme | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  useEffect(() => {
    if (isAuthReady && !currentUser && !isLoading) router.push('/');
  }, [currentUser, isAuthReady, isLoading, router]);

  useEffect(() => {
    if (currentUser) {
      setEditedProfile({ 
        name: currentUser.name, 
        headline: currentUser.headline, 
        summary: currentUser.summary, 
        location: currentUser.location, 
        photo_url: currentUser.photo_url 
      });
    }
  }, [currentUser]);

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
    setIsLoadingTheme(true);
    try {
      const res = await fetch('/api/profile/theme', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name: currentUser.name, 
          headline: currentUser.headline, 
          areas: areas.map(a => a.name) 
        }) 
      });
      if (res.ok) setProfileTheme(await res.json());
    } catch (e) { 
      console.error(e); 
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
    toast.success('Perfil atualizado!');
    fetchTheme();
  };

  const handleGenerateSummary = async () => {
    if (!currentUser) return;
    setIsGeneratingSummary(true);
    try {
      const userExps = experiences
        .filter(e => e.user_id === currentUser.id)
        .map(e => ({
          role: e.role,
          company: e.company_name,
          duration: calcDuration(e.start_date, e.end_date)
        }));
      
      const userEdu = education
        .filter(e => e.user_id === currentUser.id)
        .map(e => ({
          course: e.course,
          institution: e.institution
        }));

      const userSkills = areaSkills
        .filter(as => areas.some(a => a.id === as.area_id && a.user_id === currentUser.id))
        .map(as => skills.find(s => s.id === as.skill_id)?.name)
        .filter(Boolean) as string[];

      const result = await generateProfessionalSummary({ 
        name: editedProfile.name || currentUser.name, 
        headline: editedProfile.headline || currentUser.headline, 
        experiences: userExps, 
        skills: [...new Set(userSkills)],
        education: userEdu
      });
      
      setEditedProfile(prev => ({ ...prev, summary: result.summary }));
      toast.info('Resumo gerado pela IA!');
    } catch (error) { 
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao processar resumo com IA.'); 
    } finally { 
      setIsGeneratingSummary(false); 
    }
  };

  const copyProfileLink = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(`${window.location.origin}/${currentUser.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copiado!');
  };

  const handleSaveEdu = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!editingEdu) return; 
    setIsProcessing(true); 
    await updateEducation(editingEdu); 
    setIsProcessing(false); 
    setEditingEdu(null); 
    toast.success('Atualizado!'); 
  };
  
  const handleSavePort = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!editingPort) return; 
    setIsProcessing(true); 
    await updatePortfolioItem(editingPort); 
    setIsProcessing(false); 
    setEditingPort(null); 
    toast.success('Atualizado!'); 
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    setIsProcessing(true);
    await updateExperience(editingExp);
    setIsProcessing(false);
    setEditingExp(null);
    toast.success('Experiência atualizada!');
  };
  
  const handleSaveArea = async () => { 
    if (!editingArea || !areaForm.name) return; 
    setIsProcessing(true); 
    await updateArea({ ...editingArea, ...areaForm } as ProfessionalArea); 
    setIsProcessing(false); 
    setEditingArea(null); 
    toast.success('Atualizado!'); 
  };

  if (!isAuthReady || (isLoading && !currentUser)) return <div className="min-h-screen flex items-center justify-center"><LucideIcons.Loader2 className="animate-spin" /></div>;
  if (!currentUser) return null;

  return (
    <>
      <div className="fixed top-4 left-4 z-20 flex items-center gap-2">
        <Button variant="secondary" onClick={() => router.push(`/${currentUser.username}`)}>Ver Perfil</Button>
        <Button variant={copied ? 'accent' : 'secondary'} className={copied ? 'bg-emerald-500 text-white' : ''} onClick={copyProfileLink}>
          {copied ? <LucideIcons.Check size={16} /> : <LucideIcons.Copy size={16} />}
          {copied ? 'Copiado' : 'Link'}
        </Button>
        <Button variant="danger" onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>Sair</Button>
      </div>

      <ThemedProfileLayout
        user={currentUser} 
        areas={areas} 
        education={education.filter(e => e.user_id === currentUser.id)} 
        portfolio={portfolio.filter(p => p.user_id === currentUser.id)}
        isOwner={true} 
        onEditProfile={() => setIsEditingProfile(true)} 
        onAddContent={() => setIsAddingContent(true)}
        onEditArea={(area: any) => { setEditingArea(area); setAreaForm(area); }} 
        onDeleteArea={(id) => { if(confirm('Excluir esta área e todas as suas experiências?')) removeArea(id); }}
        onEditEducation={setEditingEdu} 
        onDeleteEducation={(id) => { if(confirm('Excluir esta formação?')) removeEducation(id); }} 
        onEditPortfolio={setEditingPort} 
        onDeletePortfolio={(id) => { if(confirm('Excluir este item do portfólio?')) removePortfolioItem(id); }}
        onEditExperience={setEditingExp}
        onDeleteExperience={(id) => { if(confirm('Excluir esta experiência?')) removeExperience(id); }}
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

      <Modal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} title="Editar Perfil">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div {...getRootProps()} className={cn("w-full border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all", isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200')}>
            <input {...getInputProps()} />
            {editedProfile.photo_url ? (
              <img src={editedProfile.photo_url} alt="profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <LucideIcons.Camera size={40} className="text-slate-400" />
            )}
            <p className="text-sm font-bold text-slate-500">Alterar Foto de Perfil</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelCls}>Nome</label><input className={inputCls} value={editedProfile.name || ''} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} /></div>
            <div><label className={labelCls}>Headline</label><input className={inputCls} value={editedProfile.headline || ''} onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })} /></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={labelCls}>Resumo Profissional</label>
              <button 
                type="button" 
                onClick={handleGenerateSummary} 
                disabled={isGeneratingSummary} 
                className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {isGeneratingSummary ? <LucideIcons.Loader2 size={12} className="animate-spin" /> : <LucideIcons.Sparkles size={12} />}
                {isGeneratingSummary ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            <RichEditor content={editedProfile.summary || ''} onChange={(val) => setEditedProfile({ ...editedProfile, summary: val })} />
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
            <Button className="flex-1" type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingEdu} onClose={() => setEditingEdu(null)} title="Editar Formação">
        <form onSubmit={handleSaveEdu} className="space-y-4">
          <div><label className={labelCls}>Instituição</label><input required value={editingEdu?.institution || ''} onChange={e => setEditingEdu(p => p ? {...p, institution: e.target.value} : null)} className={inputCls} /></div>
          <div><label className={labelCls}>Curso</label><input required value={editingEdu?.course || ''} onChange={e => setEditingEdu(p => p ? {...p, course: e.target.value} : null)} className={inputCls} /></div>
          <Button className="w-full" type="submit">Salvar</Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingExp} onClose={() => setEditingExp(null)} title="Editar Experiência">
        <form onSubmit={handleSaveExp} className="space-y-4">
          <div><label className={labelCls}>Cargo</label><input required value={editingExp?.role || ''} onChange={e => setEditingExp(p => p ? {...p, role: e.target.value} : null)} className={inputCls} /></div>
          <div><label className={labelCls}>Empresa</label><input required value={editingExp?.company_name || ''} onChange={e => setEditingExp(p => p ? {...p, company_name: e.target.value} : null)} className={inputCls} /></div>
          <div><label className={labelCls}>Descrição</label><RichEditor content={editingExp?.description || ''} onChange={v => setEditingExp(p => p ? {...p, description: v} : null)} /></div>
          <Button className="w-full" type="submit">Atualizar</Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingPort} onClose={() => setEditingPort(null)} title="Editar Portfólio">
        <form onSubmit={handleSavePort} className="space-y-4">
          <div><label className={labelCls}>Título</label><input required value={editingPort?.title || ''} onChange={e => setEditingPort(p => p ? {...p, title: e.target.value} : null)} className={inputCls} /></div>
          <div><label className={labelCls}>Descrição</label><textarea className={inputCls} rows={4} value={editingPort?.description || ''} onChange={e => setEditingPort(p => p ? {...p, description: e.target.value} : null)} /></div>
          <Button className="w-full" type="submit">Salvar</Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingArea} onClose={() => setEditingArea(null)} title="Estilo da Área">
        <div className="space-y-4">
          <div><label className={labelCls}>Nome da Área</label><input value={areaForm.name || ''} onChange={e => setAreaForm({...areaForm, name: e.target.value})} className={inputCls} /></div>
          <div>
            <label className={labelCls}>Cor Principal</label>
            <div className="flex gap-2">
              <input type="color" value={areaForm.theme_color || '#3b82f6'} onChange={e => setAreaForm({...areaForm, theme_color: e.target.value})} className="h-12 w-12 rounded-xl cursor-pointer" />
              <input value={areaForm.theme_color || ''} onChange={e => setAreaForm({...areaForm, theme_color: e.target.value})} className="flex-1 font-mono uppercase text-sm px-4 rounded-xl border" />
            </div>
          </div>
          <Button className="w-full" onClick={handleSaveArea}>Aplicar Design</Button>
        </div>
      </Modal>
    </>
  );
}
