import { Experience } from '@/lib/store';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getTheme } from '@/styles/themes';

export default function ExperienceCard({ experience, areaSlug }: { experience: Experience, areaSlug: string }) {
  const theme = getTheme(areaSlug);
  
  const startDate = format(new Date(experience.start_date), 'MMM yyyy', { locale: ptBR });
  const endDate = experience.end_date ? format(new Date(experience.end_date), 'MMM yyyy', { locale: ptBR }) : 'Atual';

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${theme.border} hover:shadow-md transition-shadow relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${theme.primary}`} />
      
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
          <Image
            src={experience.company_logo}
            alt={experience.company_name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{experience.role}</h3>
          <div className="text-slate-600 font-medium mb-1">{experience.company_name}</div>
          <div className="text-sm text-slate-400 mb-4 capitalize">
            {startDate} - {endDate}
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            {experience.description}
          </p>
        </div>
      </div>
    </div>
  );
}
