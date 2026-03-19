
'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, X, CreditCard, User, Globe } from 'lucide-react';
import { Modal } from '@/components/feedback/Modal';
import { SharingService } from '@/lib/services/sharing';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

/**
 * @fileOverview Componente de Identidade Digital (Wallet Style).
 */

export function DigitalWalletPass({ user, isOpen, onClose, accentColor }: any) {
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${user.username}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sua Identidade Digital" maxWidth="max-w-md">
      <div className="flex flex-col items-center space-y-8 pb-6">
        {/* Pass Card Visual */}
        <motion.div 
          initial={{ rotateY: -20, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className="relative w-full aspect-[1.58/1] rounded-[2rem] p-8 text-white overflow-hidden shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${accentColor}, #0f172a)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">Professional Pass</p>
                  <p className="text-xs font-black uppercase">Curion X Network</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Membro desde</p>
                <p className="text-[10px] font-bold">2025</p>
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
                <Image src={user.avatar_path || `https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} fill className="object-cover" />
              </div>
              <div className="flex-1 pb-1">
                <h3 className="text-xl font-black uppercase tracking-tighter leading-tight line-clamp-1">{user.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{user.headline || 'Especialista'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="w-full space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <QRCodeSVG value={profileUrl} size={80} level="H" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Acesso Rápido</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Escaneie para abrir o portfólio interativo completo em qualquer dispositivo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => SharingService.generateVCard(user)}
              className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-4 rounded-2xl"
            >
              <Download size={16} /> Salvar Contato
            </Button>
            <Button 
              onClick={() => SharingService.shareProfile(user)}
              variant="secondary"
              className="py-4 rounded-2xl"
            >
              <Share2 size={16} /> Compartilhar
            </Button>
          </div>
        </div>

        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] text-center">
          Verified Professional Identity • Curion X
        </p>
      </div>
    </Modal>
  );
}
