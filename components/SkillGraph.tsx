'use client';

import { AreaSkill, Skill } from '@/lib/store';
import { getTheme } from '@/styles/themes';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export default function SkillGraph({ areaSkills, allSkills, areaSlug }: { areaSkills: AreaSkill[], allSkills: Skill[], areaSlug: string }) {
  const theme = getTheme(areaSlug);

  return (
    <div className="space-y-6">
      {areaSkills.map((as) => {
        const skill = allSkills.find(s => s.id === as.skill_id);
        if (!skill) return null;
        
        // @ts-ignore
        const Icon = LucideIcons[skill.icon] || LucideIcons.CheckCircle;

        return (
          <div key={as.id} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${theme.text}`} />
                <span className="font-medium text-slate-700">{skill.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-400">{as.level}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${as.level}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${theme.primary} rounded-full`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
