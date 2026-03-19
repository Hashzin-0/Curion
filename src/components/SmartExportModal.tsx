'use client';

import { useState } from 'react';
import { Modal } from '@/components/feedback/Modal';
import { Button } from '@/components/ui/Button';
import { inputCls, labelCls } from '@/components/ui/SharedUI';
import { useStore } from '@/lib/store';
import { Sparkles, Loader2, FileText, Upload, BrainCircuit, FileUp, Type } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configuração do PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SmartExportModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { currentUser, experiences, education, portfolio, areaSkills, skills, areas } = useStore();
  
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText;
    } else if (file.type.startsWith('image/')) {
      const result = await Tesseract.recognize(file, 'por');
      return result.data.text;
    }
    return '';
  };

  const handleSmartMatch = async () => {
    if (!currentUser) return;
    
    setIsProcessing(true);
    const toastId = toast.loading('Analisando requisitos e seu perfil...');

    try {
      let finalJobText = jobDescription;
      
      if (inputMode === 'file' && jobFile) {
        finalJobText = await extractTextFromFile(jobFile);
      }

      if (!finalJobText || finalJobText.trim().length < 10) {
        throw new Error('Por favor, forneça uma descrição da vaga válida.');
      }

      // Coleta dados completos para o match
      const profileContext = {
        experiences: experiences.filter(e => e.user_id === currentUser.id),
        education: education.filter(e => e.user_id === currentUser.id),
        portfolio: portfolio.filter(p => p.user_id === currentUser.id),
        skills: areaSkills
          .filter(as => areas.some(a => a.id === as.area_id && a.user_id === currentUser.id))
          .map(as => ({ id: as.id, name: skills.find(s => s.id === as.skill_id)?.name }))
      };

      const res = await fetch('/api/resume/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: finalJobText, profile: profileContext }),
      });

      if (!res.ok) throw new Error('Falha na resposta da IA');
      const matchResult = await res.json();

      // Salva no localStorage para o preview de currículo carregar
      localStorage.setItem('career_canvas_smart_match', JSON.stringify({
        ...matchResult,
        timestamp: Date.now()
      }));

      toast.success('Análise concluída! Gerando currículo otimizado...', { id: toastId });
      onClose();
      router.push('/resume?smart=true');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao processar exportação inteligente.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => setJobFile(files[0]),
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportação Inteligente">
      <div className="space-y-6">
        <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">IA de Curadoria</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
              Forneça os detalhes da vaga (texto ou arquivo). Nossa IA selecionará os melhores pontos do seu perfil para esta oportunidade.
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setInputMode('text')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
          >
            <Type className="w-4 h-4 inline mr-2" /> Texto
          </button>
          <button 
            onClick={() => setInputMode('file')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
          >
            <FileUp className="w-4 h-4 inline mr-2" /> Arquivo (PDF/Imagem)
          </button>
        </div>

        {inputMode === 'text' ? (
          <div className="space-y-2">
            <label className={labelCls}>Descrição da Vaga ou Requisitos</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={inputCls + " min-h-[200px] resize-none text-xs"}
              placeholder="Cole aqui os requisitos da vaga..."
            />
          </div>
        ) : (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              {jobFile ? jobFile.name : 'Arraste o arquivo da vaga aqui ou clique para selecionar'}
            </p>
            <p className="text-[10px] text-slate-400 mt-2 uppercase">PDF, PNG ou JPG</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
            onClick={handleSmartMatch}
            disabled={isProcessing || (inputMode === 'text' ? !jobDescription : !jobFile)}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isProcessing ? 'Analisando...' : 'Gerar Currículo Otimizado'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
