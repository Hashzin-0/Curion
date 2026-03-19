'use client'

import { useState } from 'react';
import { Modal } from './feedback/Modal';
import { inputCls, labelCls } from './ui/SharedUI';
import { FileUp, Type, Loader2, Sparkles, FileText, BrainCircuit } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { parseResumeText } from '@/ai/flows/parse-resume-text-flow';

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportResumeModal({ isOpen, onClose }: ImportResumeModalProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('file');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      setIsLoading(true);
      try {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (arrayBuffer) {
              // Correção da importação dinâmica para compatibilidade com pdfjs-dist v4+
              const pdfjs = await import('pdfjs-dist');
              pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
              
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
              }
              setText(fullText);
            }
          };
          reader.readAsArrayBuffer(file);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setText(result);
          };
          reader.readAsText(file);
        }
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        toast.error('Erro ao ler arquivo. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const parsedData = await parseResumeText({ text });
      // TODO: Sincronizar dados analisados com o perfil do usuário (Store)
      toast.success('Currículo analisado com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Falha ao analisar currículo. Verifique o conteúdo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Currículo">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('file')} 
          className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
        >
          Arquivo (PDF/Texto)
        </button>
        <button 
          onClick={() => setActiveTab('text')} 
          className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
        >
          Colar Texto
        </button>
      </div>

      {activeTab === 'file' ? (
        <div 
          {...getRootProps()} 
          className={`p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="font-bold text-slate-900 dark:text-white">{fileName || 'Arraste o arquivo ou clique para selecionar'}</p>
          <p className="text-xs text-slate-500 mt-2 uppercase">PDF, TXT, DOCX</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="resume-text" className={labelCls}>Conteúdo do Currículo</label>
          <textarea
            id="resume-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${inputCls} min-h-[250px] mt-2 resize-none text-sm`}
            placeholder="Cole aqui o texto do seu currículo antigo..."
          />
        </div>
      )}

      <div className="mt-8 flex justify-end items-center gap-4">
        <button onClick={onClose} className="font-black text-xs uppercase text-slate-500 hover:text-slate-900 transition-colors">Cancelar</button>
        <button 
          onClick={handleImport} 
          disabled={!text || isLoading} 
          className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-xl hover:bg-blue-700 transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
          Importar e Analisar
        </button>
      </div>
    </Modal>
  );
}