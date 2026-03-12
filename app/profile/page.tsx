'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileHeader from '@/components/ProfileHeader';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { getTheme } from '@/styles/themes';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const { currentUser, areas, addArea, isAuthReady } = useStore();
  const router = useRouter();
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaIcon, setNewAreaIcon] = useState('Briefcase');
  const [newAreaTheme, setNewAreaTheme] = useState('blue');

  useEffect(() => {
    if (isAuthReady && !currentUser) {
      router.push('/');
    }
  }, [currentUser, isAuthReady, router]);

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    const slug = newAreaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    addArea({
      name: newAreaName,
      slug,
      icon: newAreaIcon,
      theme_color: newAreaTheme,
    });

    setIsAddingArea(false);
    setNewAreaName('');
    setNewAreaIcon('Briefcase');
    setNewAreaTheme('blue');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) return null;

  const availableIcons = ['Briefcase', 'ChefHat', 'MessageSquare', 'Package', 'Code', 'PenTool', 'Camera', 'Music', 'HeartPulse'];
  const availableThemes = ['blue', 'emerald', 'orange', 'purple', 'rose', 'amber', 'cyan', 'indigo'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meu Painel</h1>
          <div className="flex items-center gap-3">
            <Link 
              href={`/${currentUser.username}`}
              className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Ver Perfil Público
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-6 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        <ProfileHeader user={currentUser} />

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Minhas Áreas de Atuação</h2>
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
                    <div className={`group relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border ${theme.border} dark:border-opacity-20 hover:shadow-md transition-all`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full ${theme.bgLight} dark:opacity-20 transition-transform group-hover:scale-150 duration-500`} />
                      <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${theme.primary} text-white flex items-center justify-center mb-6 shadow-sm`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{area.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Gerenciar experiências e currículo</p>
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
              <button 
                onClick={() => setIsAddingArea(true)}
                className="w-full h-full min-h-[200px] bg-slate-100 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <LucideIcons.Plus className="w-8 h-8 mb-2" />
                <span className="font-bold">Adicionar Nova Área</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddingArea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nova Área</h3>
                <button onClick={() => setIsAddingArea(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <LucideIcons.X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddArea} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome da Área</label>
                  <input
                    type="text"
                    required
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="Ex: Desenvolvedor Frontend"
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ícone</label>
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map(iconName => {
                      // @ts-ignore
                      const Icon = LucideIcons[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewAreaIcon(iconName)}
                          className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                            newAreaIcon === iconName 
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 border-2 border-blue-500' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor do Tema</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableThemes.map(themeColor => (
                      <button
                        key={themeColor}
                        type="button"
                        onClick={() => setNewAreaTheme(themeColor)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                          newAreaTheme === themeColor
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {themeColor}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                >
                  Criar Área
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
