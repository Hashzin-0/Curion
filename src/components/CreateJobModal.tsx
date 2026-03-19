'use client';

import { useState, useCallback } from 'react';
import { Modal } from './feedback/Modal';
import { useDropzone } from 'react-dropzone';
import { FileUp, Sparkles, Loader2, Save, MapPin, Building, Briefcase, Mail, X } from 'lucide-react';
import { toast } from 'sonner';
import { parseJobFile } from '@/ai/flows/parse-job-file-flow';
import { DatabaseService } from '@/lib/services/database';
import { useStore } from '@/lib/store';
import { inputCls, labelCls } from './ui/SharedUI';
import { Button } from './ui/Button';

export function CreateJobModal({ isOpen, onClose, onRefresh }: { isOpen: boolean; onClose: () => void; onRefresh: () => void }) {
  const { currentUser } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    contact_info: '',
    area_slug: 'vendas'
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setFilePreview(preview);
    
    setIsProcessing(true);
    const toastId = toast.loading('IA analisando o documento da vaga...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUri = reader.result as string;
        try {
          const result = await parseJobFile(dataUri);
          setFormData({
            title: result.title || '',
            company: result.company || '',
            description: result.description || '',
            requirements: result.requirements?.join(', ') || '',
            location: result.location || '',
            salary: result.salary || '',
            contact_info: result.contactInfo || '',
            area_slug: result.areaSlug || 'vendas'
          });
          toast.success('Dados extraídos com sucesso!', { id: toastId });
        } catch (err: any) {
          toast.error(err.message || 'Erro na extração IA.', { id: toastId });
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error('Erro ao ler arquivo.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Você precisa estar logado para publicar.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Publicando vaga...');

    try {
      let fileUrl = '';
      if (file) {
        fileUrl = await DatabaseService.uploadJobFile(file);
      }

      await DatabaseService.createJob({
        user_id: currentUser.id,
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        location: formData.location,
        salary: formData.salary,
        contact_info: formData.contact_info,
        area_slug: formData.area_slug,
        file_url: fileUrl
      });

      toast.success('Vaga publicada com sucesso!', { id: toastId });
      onRefresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao salvar no banco de dados. Verifique sua conexão.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setFilePreview(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publicar Nova Vaga">
      <div className="space-y-8">
        <div 
          {...getRootProps()} 
          className={`relative border-4 border-dashed rounded-[2.5rem] p-6 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          
          {filePreview ? (
            <div className="relative h-48 w-full">
              <img src={filePreview} alt="Preview" className="h-full w-full object-contain rounded-2xl" />
              <button onClick={clearFile} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="py-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                {isProcessing ? <Loader2 className="animate-spin" /> : <FileUp />}
              </div>
              <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Arraste o anúncio (Foto ou PDF)
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">A IA preencherá o formulário para você</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Título do Cargo</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputCls} placeholder="Ex: Açougueiro" />
            </div>
            <div>
              <label className={labelCls}>Empresa</label>
              <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className={inputCls} placeholder="Ex: Nova Tradição" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Localização</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={inputCls + " pl-10"} placeholder="Cidade/Bairro" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Salário (Opcional)</label>
              <input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className={inputCls} placeholder="Ex: R$ 2.500,00" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Como se candidatar (E-mail ou WhatsApp)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input required value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} className={inputCls + " pl-10"} placeholder="Ex: (19) 99431-8670" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Requisitos e Diferenciais (Separados por vírgula)</label>
            <textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className={inputCls + " resize-none min-h-[100px]"} placeholder="Ex: Experiência anterior, Vontade de aprender..." />
          </div>
          
          <div className="pt-4 flex gap-4">
            <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin" /> : <Save />}
              {isProcessing ? 'Publicando...' : 'Confirmar Publicação'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
