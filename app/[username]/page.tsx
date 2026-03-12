'use client';

import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileHeader from '@/components/ProfileHeader';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { getTheme } from '@/styles/themes';
import { motion } from 'motion/react';

export default function PublicProfile() {
  const { username } = useParams();
  const { users, areas } = useStore();
  const router = useRouter();

  const user = users.find(u => u.username === username);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <ProfileHeader user={user} />

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Áreas de Atuação</h2>
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
                  <Link href={`/${user.username}/${area.slug}`}>
                    <div className={`group relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border ${theme.border} dark:border-opacity-20 hover:shadow-md transition-all`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full ${theme.bgLight} dark:opacity-20 transition-transform group-hover:scale-150 duration-500`} />
                      <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${theme.primary} text-white flex items-center justify-center mb-6 shadow-sm`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{area.name}</h3>
                        <div className="flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          Ver currículo
                          <LucideIcons.ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
