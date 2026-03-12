'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileHeader from '@/components/ProfileHeader';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { getTheme } from '@/styles/themes';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { currentUser, areas } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Meu Painel</h1>
          <Link 
            href={`/${currentUser.username}`}
            className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
          >
            Ver Perfil Público
          </Link>
        </div>

        <ProfileHeader user={currentUser} />

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Minhas Áreas de Atuação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area, i) => {
              const theme = getTheme(area.slug);
              // @ts-ignore
              const Icon = LucideIcons[area.icon] || LucideIcons.Briefcase;

              return (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/${currentUser.username}/${area.slug}`}>
                    <div className={`group relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border ${theme.border} hover:shadow-md transition-all`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full ${theme.bgLight} transition-transform group-hover:scale-150 duration-500`} />
                      <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${theme.primary} text-white flex items-center justify-center mb-6 shadow-sm`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{area.name}</h3>
                        <p className="text-slate-500 text-sm font-medium">Gerenciar experiências e currículo</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: areas.length * 0.1 }}
            >
              <button className="w-full h-full min-h-[200px] bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200 hover:border-slate-400 transition-colors">
                <LucideIcons.Plus className="w-8 h-8 mb-2" />
                <span className="font-bold">Adicionar Nova Área</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
