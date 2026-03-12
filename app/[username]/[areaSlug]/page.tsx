'use client';

import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { getTheme } from '@/styles/themes';
import { motion } from 'motion/react';
import ExperienceCard from '@/components/ExperienceCard';
import SkillGraph from '@/components/SkillGraph';
import QRCodeSection from '@/components/QRCodeSection';
import html2pdf from 'html2pdf.js';
import { parseSafeDate } from '@/lib/utils';

export default function AreaResume() {
  const { username, areaSlug } = useParams();
  const { users, areas, experiences, skills, areaSkills, education } = useStore();
  const router = useRouter();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const user = users.find(u => u.username === username);
  const area = areas.find(a => a.slug === areaSlug);

  useEffect(() => {
    setIsMounted(true);
    if (!user || !area) {
      router.push('/');
    }
  }, [user, area, router]);

  if (!isMounted || !user || !area) return null;

  const theme = getTheme(area.slug);
  const areaExperiences = experiences.filter(e => e.area_id === area.id && e.user_id === user.id);
  const currentAreaSkills = areaSkills.filter(as => as.area_id === area.id);
  const userEducation = education.filter(e => e.user_id === user.id);

  // @ts-ignore
  const AreaIcon = LucideIcons[area.icon] || LucideIcons.Briefcase;

  const handleExportPDF = () => {
    if (!resumeRef.current) return;
    
    const element = resumeRef.current;
    const opt = {
      margin: 0,
      filename: `curriculo-${user.name.toLowerCase().replace(/\s+/g, '-')}-${area.slug}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className={`min-h-screen ${theme.bgLight} dark:bg-slate-950 relative font-sans transition-colors duration-300`}>
      <div className={`absolute inset-0 pointer-events-none ${theme.pattern}`} />
      <div className="relative z-10 p-4 md:p-12 max-w-5xl mx-auto">
        
        {/* Export Button (Not in PDF) */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={handleExportPDF}
            className={`px-6 py-3 ${theme.primary} text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2`}
          >
            <LucideIcons.Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

        {/* Resume Container (This gets exported) */}
        <div 
          ref={resumeRef} 
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden print:shadow-none print:rounded-none"
        >
          {/* Header */}
          <div className={`${theme.primary} p-12 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg shrink-0 bg-white">
                <Image
                  src={user.photo_url}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-4 backdrop-blur-sm">
                  <AreaIcon className="w-4 h-4" />
                  {area.name}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{user.name}</h1>
                <p className="text-white/80 text-lg mb-4 max-w-2xl">{user.summary}</p>
                <div className="flex items-center justify-center md:justify-start text-white/70 text-sm font-medium">
                  <LucideIcons.MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content (Left Column) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Experiences */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-xl ${theme.bgLight} dark:bg-slate-800 ${theme.text} dark:text-slate-200 flex items-center justify-center`}>
                    <LucideIcons.Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Experiência Profissional</h2>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                  {areaExperiences.map((exp, i) => (
                    <motion.div 
                      key={exp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 ${theme.bgLight} dark:bg-slate-800 ${theme.text} dark:text-slate-200 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                        <LucideIcons.CircleDot className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4">
                        <ExperienceCard experience={exp} areaSlug={area.slug} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-xl ${theme.bgLight} dark:bg-slate-800 ${theme.text} dark:text-slate-200 flex items-center justify-center`}>
                    <LucideIcons.GraduationCap className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Formação Acadêmica</h2>
                </div>
                
                <div className="space-y-4">
                  {userEducation.map(edu => (
                    <div key={edu.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{edu.course}</h3>
                      <div className="text-slate-600 dark:text-slate-400 font-medium mb-1">{edu.institution}</div>
                      <div className="text-sm text-slate-400 dark:text-slate-500 capitalize">
                        {parseSafeDate(edu.start_date).getFullYear()} - {edu.end_date ? parseSafeDate(edu.end_date).getFullYear() : 'Atual'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sidebar (Right Column) */}
            <div className="space-y-12">
              
              {/* Skills */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 rounded-xl ${theme.bgLight} dark:bg-slate-800 ${theme.text} dark:text-slate-200 flex items-center justify-center`}>
                    <LucideIcons.Star className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Habilidades</h2>
                </div>
                <SkillGraph areaSkills={currentAreaSkills} allSkills={skills} areaSlug={area.slug} />
              </section>

              {/* QR Code */}
              <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <QRCodeSection url={currentUrl} areaSlug={area.slug} />
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
