'use client';

import { useState } from 'react';
import { Modal, Button, inputCls, labelCls } from './ui/SharedUI';
import { useStore } from '@/lib/store';
import { Sparkles, Loader2, FileText, Upload, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SmartExportModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { currentUser, experiences, education, portfolio, areaSkills, skills, areas } = useStore();
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSmartMatch = async () => {
    if (!jobDescription || !currentUser) return;
    setIsProcessing(true);
    const toastId = toast.loading('IA analisando a vaga e seu perfil...');

    try {
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
        body: JSON.stringify({ jobDescription, profile: profileContext }),
      });

      if (!res.ok) throw new Error('Falha na resposta da IA');
      const matchResult = await res.json();

      // Salva no localStorage para o preview de currículo carregar
      localStorage.setItem('career_canvas_smart_match', JSON.stringify({
        ...matchResult,
        timestamp: Date.now()
      }));

      toast.success('Match concluído! Gerando currículo otimizado...', { id: toastId });
      onClose();
      router.push('/resume?smart=true');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar exportação inteligente.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

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
              Cole a descrição da vaga abaixo. Nossa IA selecionará as experiências e projetos do seu perfil que mais se alinham com o que o recrutador busca.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Descrição da Vaga ou Requisitos</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className={inputCls + " min-h-[200px] resize-none text-xs"}
            placeholder="Ex: Procuramos um desenvolvedor com 3 anos de experiência em React e Node.js que saiba trabalhar com metodologias ágeis..."
          />
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
            onClick={handleSmartMatch}
            disabled={isProcessing || !jobDescription}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isProcessing ? 'Processando...' : 'Gerar Currículo Otimizado'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
