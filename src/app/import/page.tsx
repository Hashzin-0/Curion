
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileUp, Type, Sparkles, Loader2, FileText, 
  ArrowLeft, Check, AlertCircle, Wand2, Save,
  Briefcase, GraduationCap, Star, User
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { parseResumeText } from '@/ai/flows/parse-resume-text-flow';
import { useStore } from '@/lib/store';
import { DatabaseService } from '@/lib/services/database';
import Link from 'next/link';
import * as pdfjs from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configuração do PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const inputCls = "w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium";
const labelCls = "block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2";

export default function ImportPage() {
  const router = useRouter();
  const { currentUser, processBackgroundImport } = useStore();
  
  const [step, setStep] = useState<'upload' | 'parsing' | 'review'>('upload');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  const extractText = async (f: File): Promise<string> => {
    if (f.type === 'application/pdf') {
      setParsingStatus('Iniciando leitura do PDF...');
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        setParsingStatus(`Lendo PDF: página ${i} de ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return fullText;
    } else if (f.type.startsWith('image/')) {
      setParsingStatus('Iniciando reconhecimento de imagem (OCR)...');
      const result = await Tesseract.recognize(f, 'por', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setParsingStatus(`Analisando imagem: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      return result.data.text;
    }
    return '';
  };

  const handleStartParsing = async () => {
    setIsProcessing(true);
    setStep('parsing');
    setParsingStatus('Preparando documento...');
    
    try {
      let textToParse = rawText;
      if (inputMode === 'file' && file) {
        textToParse = await extractText(file);
      }

      if (!textToParse || textToParse.trim().length < 20) {
        throw new Error('Texto insuficiente para análise. Por favor, forneça mais detalhes.');
      }

      setParsingStatus('IA analisando estrutura e organizando dados...');
      const result = await parseResumeText({ text: textToParse });
      
      setParsedData(result);
      setStep('review');
      toast.success('Currículo analisado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar currículo.');
      setStep('upload');
    } finally {
      setIsProcessing(false);
      setParsingStatus('');
    }
  };

  const handleConfirmImport = async () => {
    if (!currentUser || !parsedData) return;
    
    // Dispara a ingestão em background na Store Global
    // Isso permite que o usuário saia desta página e o processo continue.
    processBackgroundImport(currentUser.id, parsedData);
    
    // Redireciona imediatamente para o perfil para ver os dados aparecendo
    toast.info('Salvando dados em segundo plano. Você já pode ver seu perfil atualizado!');
    router.push('/profile');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => { setFile(files[0]); setInputMode('file'); },
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <Link href="/profile" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors">
            <ArrowLeft size={20} /> Voltar ao Perfil
          </Link>
          <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Importador Inteligente
          </div>
        </header>

        {step === 'upload' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                Transforme seu currículo antigo.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                Arraste seu PDF, foto ou cole o texto. Nossa IA vai organizar tudo em blocos profissionais para o seu novo portfólio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                {...getRootProps()} 
                className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-[3rem] transition-all cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400'}`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
                  <FileUp size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {file ? file.name : 'Upload de Arquivo'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-2">PDF, PNG ou JPEG</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Type size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Texto Bruto</h3>
                </div>
                <textarea 
                  value={rawText}
                  onChange={(e) => { setRawText(e.target.value); setInputMode('text'); }}
                  placeholder="Cole aqui o conteúdo do seu currículo..."
                  className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent focus:border-emerald-500 outline-none resize-none text-sm font-medium"
                />
              </div>
            </div>

            <button 
              onClick={handleStartParsing}
              disabled={isProcessing || (inputMode === 'file' ? !file : !rawText)}
              className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {isProcessing ? 'Analisando Dados...' : 'Começar Importação'}
            </button>
          </div>
        )}

        {step === 'parsing' && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-blue-100 dark:border-slate-800 rounded-full animate-spin border-t-blue-600" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-12 h-12 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">A IA está trabalhando</h2>
              <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-xs mt-4 animate-pulse">
                {parsingStatus}
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm italic">Extraindo experiências, datas e habilidades do seu documento...</p>
            </div>
          </div>
        )}

        {step === 'review' && parsedData && (
          <div className="animate-in fade-in zoom-in-95 duration-500 space-y-12">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500" />
              
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1 space-y-8">
                  <header>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 flex items-center gap-2">
                      <Check className="text-emerald-500" /> Revisar Importação
                    </h2>
                    <p className="text-slate-500 font-medium text-sm">Confirme as informações extraídas antes de salvar no seu perfil.</p>
                  </header>

                  <section className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={14} /> Experiências Encontradas ({parsedData.experiences?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {parsedData.experiences?.map((exp: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <div className="font-black text-slate-900 dark:text-white uppercase text-sm">{exp.role}</div>
                          <div className="text-xs font-bold text-blue-600">{exp.company}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap size={14} /> Educação ({parsedData.education?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {parsedData.education?.map((edu: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <div className="font-black text-slate-900 dark:text-white uppercase text-sm">{edu.course}</div>
                          <div className="text-xs font-bold text-emerald-600">{edu.institution}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="w-full md:w-72 space-y-6 shrink-0">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
                    <h4 className="font-black text-blue-600 dark:text-blue-400 text-xs uppercase tracking-widest mb-3">Modo Background</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      Ao clicar em salvar, você será levado ao seu perfil enquanto a IA sincroniza tudo em segundo plano.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleConfirmImport}
                      className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex flex-col items-center justify-center gap-1 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Save />
                        Confirmar e Sair
                      </div>
                    </button>

                    <button 
                      onClick={() => setStep('upload')}
                      className="w-full py-4 text-slate-400 font-black text-xs uppercase hover:text-slate-900 transition-colors"
                    >
                      Recomeçar
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
