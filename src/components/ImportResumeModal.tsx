'use client';

import { useState } from 'react';
import { Modal, Button, inputCls, labelCls } from './ui/SharedUI';
import { FileUp, Type, Loader2, Sparkles, FileText, BrainCircuit } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { parseResumeText } from '@/ai/flows/parse-resume-text-flow';
import { matchJobRequirements } from '@/ai/flows/match-job-requirements-flow';
import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportResumeModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('file');
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

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

  const handleImport = async () => {
    setIsProcessing(true);
    const toastId = toast.loading('Processando currículo com IA...');

    try {
      let finalResumeText = resumeText;
      if (inputMode === 'file' && resumeFile) {
        finalResumeText = await extractTextFromFile(resumeFile);
      }

      if (!finalResumeText) {
        throw new Error('Por favor, forneça o texto ou arquivo do currículo.');
      }

      const parsedData = await parseResumeText({ text: finalResumeText });

      let matchResult = null;
      if (jobText) {
        matchResult = await matchJobRequirements({ 
          jobDescription: jobText, 
          profile: { 
            experiences: parsedData.experiences || [], 
            education: parsedData.education || [], 
            skills: parsedData.skills || [] 
          } 
        });
      }

      localStorage.setItem('career_canvas_import_data', JSON.stringify({
        parsedData,
        matchResult,
        jobDescription: jobText,
        timestamp: Date.now()
      }));

      toast.success('Currículo processado! Abrindo visualização...', { id: toastId });
      onClose();
      router.push('/resume?imported=true');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao processar importação.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => setResumeFile(files[0]),
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Currículo">
      <div className="space-y-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setInputMode('file')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}
          >
            <FileUp className="w-4 h-4 inline mr-2" /> Arquivo (PDF/Imagem)
          </button>
          <button 
            onClick={() => setInputMode('text')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}
          >
            <Type className="w-4 h-4 inline mr-2" /> Texto Copiado
          </button>
        </div>

        {inputMode === 'file' ? (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
            <input {...getInputProps()} />
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-600">
              {resumeFile ? resumeFile.name : 'Arraste seu currículo aqui ou clique para selecionar'}
            </p>
            <p className="text-[10px] text-slate-400 mt-2 uppercase">PDF, PNG ou JPG</p>
          </div>
        ) : (
          <textarea 
            value={resumeText} 
            onChange={(e) => setResumeText(e.target.value)} 
            className={inputCls + " min-h-[150px] text-xs"} 
            placeholder="Cole aqui o texto do seu currículo atual..." 
          />
        )}

        <div className="space-y-2">
          <label className={labelCls}>Detalhes da Vaga (Opcional)</label>
          <textarea 
            value={jobText} 
            onChange={(e) => setJobText(e.target.value)} 
            className={inputCls + " min-h-[100px] text-xs"} 
            placeholder="Cole aqui os requisitos da vaga para otimizar o currículo..." 
          />
          <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
            <BrainCircuit size={12} /> IA selecionará os melhores pontos para esta vaga
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button 
            className="flex-1" 
            onClick={handleImport}
            disabled={isProcessing || (inputMode === 'file' && !resumeFile && !resumeText)}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isProcessing ? 'Processando...' : 'Importar e Visualizar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}