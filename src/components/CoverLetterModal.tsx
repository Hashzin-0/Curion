
'use client';

import { useState } from 'react';
import { Modal } from '@/components/feedback/Modal';
import { Button } from '@/components/ui/Button/index';
import { inputCls, labelCls } from '@/components/ui/SharedUI';
import { useStore } from '@/lib/store';
import { FileText, Loader2, Sparkles, Copy, Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function CoverLetterModal({ isOpen, onClose }: Props) {
  const { currentUser, experiences } = useStore();
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ letter: string; subject: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!currentUser || !jobDescription) return;
    
    setIsGenerating(true);
    setResult(null);
    const toastId = toast.loading('Redigindo sua carta personalizada...');

    try {
      const res = await fetch('/api/resume/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          profile: {
            name: currentUser.name,
            headline: currentUser.headline,
            summary: currentUser.summary,
            experiences: experiences.filter(e => e.user_id === currentUser.id)
          }
        }),
      });

      if (!res.ok) throw new Error('Falha na IA');
      const data = await res.json();
      setResult(data);
      toast.success('Carta gerada com sucesso!', { id: toastId });
    } catch (err) {
      toast.error('Erro ao gerar carta.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Assunto: ${result.subject}\n\n${result.letter}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Conteúdo copiado!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerador de Carta de Apresentação">
      {!result ? (
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl flex items-start gap-4 border border-emerald-100 dark:border-emerald-800">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Mail className="text-white w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">Destaque-se na multidão</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                Cole a descrição da vaga abaixo. Nossa IA criará uma carta focada em convencer o recrutador de que você é o match perfeito.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Descrição da Vaga</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={inputCls + " min-h-[250px] resize-none text-xs"}
              placeholder="Cole aqui os requisitos ou a descrição completa da vaga..."
            />
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={handleGenerate}
              disabled={isGenerating || !jobDescription}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {isGenerating ? 'Escrevendo...' : 'Gerar Carta com IA'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assunto Sugerido</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{result.subject}</p>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700 w-full" />
            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {result.letter}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setResult(null)}>
              Tentar Outra Vaga
            </Button>
            <Button className="flex-1" onClick={handleCopy}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
