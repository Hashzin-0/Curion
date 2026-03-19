'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal } from "@/components/feedback/Modal";
import { Button } from "@/components/ui/Button";
import { inputCls, labelCls } from "@/components/ui/SharedUI";
import { RichEditor } from "@/components/RichEditor";
import * as LucideIcons from 'lucide-react';
import { cn } from "@/lib/utils";
import { useSummaryGeneration } from '@/modules/profile/hooks/useSummaryGeneration';
import { PhotoCropModal } from '@/components/PhotoCropModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editedProfile: any;
  setEditedProfile: (data: any) => void;
  onSave: (data: any, onDone: () => void) => Promise<void>;
  isSaving?: boolean;
}

export function EditProfileModal({ isOpen, onClose, editedProfile, setEditedProfile, onSave, isSaving }: Props) {
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const { isGeneratingSummary, handleGenerateSummary } = useSummaryGeneration();

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
        <form onSubmit={(e) => { e.preventDefault(); onSave(editedProfile, onClose); }} className="space-y-6">
          <div {...getRootProps()} className={cn("w-full border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all", isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 dark:border-slate-800')}>
            <input {...getInputProps()} />
            {editedProfile.avatar_path ? (
              <img src={editedProfile.avatar_path} alt="profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <LucideIcons.Camera size={40} className="text-slate-400" />
            )}
            <p className="text-sm font-bold text-slate-500">Alterar Foto de Perfil</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelCls}>Nome Completo</label><input className={inputCls} value={editedProfile.name || ''} onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })} required /></div>
            <div><label className={labelCls}>Headline (Slogan Profissional)</label><input className={inputCls} value={editedProfile.headline || ''} onChange={(e) => setEditedProfile({ ...editedProfile, headline: e.target.value })} placeholder="Ex: Desenvolvedor Fullstack" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className={labelCls}>Email de Contato</label><input type="email" className={inputCls} value={editedProfile.email || ''} onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })} /></div>
            <div><label className={labelCls}>WhatsApp / Telefone</label><input className={inputCls} value={editedProfile.phone || ''} onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })} /></div>
          </div>

          <div><label className={labelCls}>Localização</label><input className={inputCls} value={editedProfile.location || ''} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} placeholder="Ex: São Paulo, SP" /></div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={labelCls}>Resumo Profissional</label>
              <button 
                type="button" 
                onClick={() => handleGenerateSummary(editedProfile, setEditedProfile)} 
                disabled={isGeneratingSummary} 
                className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {isGeneratingSummary ? <LucideIcons.Loader2 size={12} className="animate-spin" /> : <LucideIcons.Sparkles size={12} />}
                {isGeneratingSummary ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            <RichEditor content={editedProfile.summary || ''} onChange={(val: any) => setEditedProfile({ ...editedProfile, summary: val })} />
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1" type="submit" disabled={isSaving}>
              {isSaving ? <LucideIcons.Loader2 className="animate-spin" /> : <LucideIcons.Save />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Modal>
      {rawImage && (
        <PhotoCropModal 
          image={rawImage} 
          isOpen={isCropOpen} 
          onClose={() => { setIsCropOpen(false); setRawImage(null); }} 
          onCropComplete={(cropped) => setEditedProfile({ ...editedProfile, avatar_path: cropped })} 
        />
      )}
    </>
  );
}
