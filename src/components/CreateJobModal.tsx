
'use client';

import { useState, useCallback } from 'react';
import { Modal } from './feedback/Modal';
import { useDropzone } from 'react-dropzone';
import { FileUp, Sparkles, Loader2, Save, MapPin, Building, Briefcase, Mail, X, Laptop, Globe, Building2, Zap, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { parseJobFile } from '@/ai/flows/parse-job-file-flow';
import { DatabaseService } from '@/lib/services/database';
import { useStore } from '@/lib/store';
import { inputCls, labelCls } from './ui/SharedUI';
import { Button } from './ui/Button';

/**
 * @fileOverview Modal de criação de vaga com suporte a extração automática via IA e Categorização Inteligente.
 * Utiliza upload direto para o storage para evitar erros de Payload Large.
 */

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
    area_slug: 'vendas',
    regime: 'clt',
    work_model: 'presencial',
    company_type: 'corporativo'
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    setFilePreview(preview);
    
    setIsProcessing(true);
    const toastId = toast.loading('IA analisando o anúncio via link seguro...');

    try {
      // Estratégia de Upload Direto para evitar Base64 Large payloads
      const publicUrl = await DatabaseService.uploadFile(selectedFile, 'temp-analysis');
      
      const result = await parseJobFile(publicUrl);
      setFormData(prev => ({
        ...prev,
        title: result.title || '',
        company: result.company || '',
        description: result.description || '',
        requirements: result.requirements?.join(', ') || '',
        location: result.location || '',
        salary: result.salary || '',
        contact_info: result.contactInfo || '',
        area_slug: result.areaSlug || 'vendas'
      }));
      toast.success('IA extraiu os dados básicos!', { id: toastId });
    } catch (err: any) {
      console.error('Falha na extração IA:', err);
      toast.error('Não conseguimos ler os dados automaticamente. Por favor, preencha manualmente.', { id: toastId });
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
      toast.error('Você precisa estar logado para publicar uma vaga.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Sincronizando com o Hub...');

    try {
      let fileUrl = '';
      if (file) {
        fileUrl = await DatabaseService.uploadJobFile(file);
      }

      const requirementsArray = formData.requirements
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      await DatabaseService.createJob({
        user_id: currentUser.id,
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: requirementsArray,
        location: formData.location,
        salary: formData.salary,
        contact_info: formData.contact_info,
        area_slug: formData.area_slug,
        regime: formData.regime,
        work_model: formData.work_model,
        company_type: formData.company_type,
        file_url: fileUrl || null
      });

      toast.success('Vaga publicada com sucesso!', { id: toastId });
      onRefresh();
      onClose();
      // Reset
      setFormData({
        title: '', company: '', description: '', requirements: '', 
        location: '', salary: '', contact_info: '', area_slug: 'vendas',
        regime: 'clt', work_model: 'presencial', company_type: 'corporativo'
      });
      setFile(null);
      setFilePreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar vaga.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setFilePreview(null);
  };

  const SelectGroup = ({ label, options, value, onChange, icon: Icon }: any) => (
    <div className="space-y-2">
      <label className={labelCls + " flex items-center gap-2"}>
        {Icon && <Icon size={14} className="text-blue-500" />}
        {label}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt: any) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${value === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-blue-200'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Anunciar Oportunidade">
      <div className="space-y-6 pb-10">
        <div 
          {...getRootProps()} 
          className={`relative border-4 border-dashed rounded-[2.5rem] p-6 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          
          {filePreview ? (
            <div className="relative h-48 w-full group">
              <img src={filePreview} alt="Preview" className="h-full w-full object-contain rounded-2xl" />
              <button onClick={clearFile} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-all">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="py-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                {isProcessing ? <Loader2 className="animate-spin" /> : <FileUp />}
              </div>
              <p className="font-black text-slate-900 dark:text-white uppercase text-sm">Upload do Anúncio</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">A IA fará a leitura automática</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Cargo</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputCls} placeholder="Ex: Chef de Cozinha" /></div>
            <div><label className={labelCls}>Empresa</label><input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className={inputCls} placeholder="Nome do local" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <SelectGroup 
              label="Regime" 
              value={formData.regime} 
              onChange={(v: string) => setFormData({...formData, regime: v})}
              options={[{id: 'clt', label: 'CLT'}, {id: 'pj', label: 'PJ'}, {id: 'freelance', label: 'Freelance'}, {id: 'estagio', label: 'Estágio'}]}
              icon={Briefcase}
            />
            <SelectGroup 
              label="Modelo" 
              value={formData.work_model} 
              onChange={(v: string) => setFormData({...formData, work_model: v})}
              options={[{id: 'remoto', label: 'Remoto'}, {id: 'hibrido', label: 'Híbrido'}, {id: 'presencial', label: 'Presencial'}]}
              icon={Globe}
            />
            <SelectGroup 
              label="Vibe / Tipo" 
              value={formData.company_type} 
              onChange={(v: string) => setFormData({...formData, company_type: v})}
              options={[{id: 'startup', label: 'Startup'}, {id: 'corporativo', label: 'Corp'}, {id: 'agencia', label: 'Agência'}, {id: 'pequena', label: 'Pequena'}]}
              icon={Zap}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Local (Cidade/Bairro)</label><input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={inputCls} placeholder="Ex: São Paulo, SP" /></div>
            <div><label className={labelCls}>Salário (opcional)</label><input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className={inputCls} placeholder="R$ 4.000,00" /></div>
          </div>

          <div><label className={labelCls}>Contato (WhatsApp ou E-mail)</label><input required value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})} className={inputCls} placeholder="Link ou número" /></div>
          <div><label className={labelCls}>Requisitos Principais</label><textarea value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className={inputCls + " resize-none h-24"} placeholder="Inglês, React, Experiência prévia..." /></div>
          
          <div className="pt-4 flex gap-4">
            <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin" /> : <Save />}
              Publicar no Hub
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
