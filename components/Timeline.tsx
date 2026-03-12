'use client';

import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Star } from 'lucide-react';

type TimelineItem = {
  id: string;
  type: 'work' | 'education' | 'achievement';
  title: string;
  organization: string;
  date: string;
  description: string;
};

const timelineData: TimelineItem[] = [
  {
    id: '1',
    type: 'work',
    title: 'Senior Frontend Developer',
    organization: 'Tech Innovators Inc.',
    date: '2022 - Present',
    description: 'Lead the frontend team in building scalable React applications. Improved performance by 40% and mentored junior developers.',
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Best Innovation Award',
    organization: 'Global Tech Summit',
    date: '2021',
    description: 'Awarded for creating an accessible component library used by over 50 internal projects.',
  },
  {
    id: '3',
    type: 'work',
    title: 'UI/UX Engineer',
    organization: 'Creative Solutions',
    date: '2019 - 2022',
    description: 'Designed and implemented responsive web interfaces. Collaborated closely with product managers and designers.',
  },
  {
    id: '4',
    type: 'education',
    title: 'BSc in Computer Science',
    organization: 'State University',
    date: '2015 - 2019',
    description: 'Graduated with honors. Specialized in Human-Computer Interaction and Web Technologies.',
  },
];

const getIcon = (type: TimelineItem['type']) => {
  switch (type) {
    case 'work':
      return <Briefcase className="w-5 h-5" />;
    case 'education':
      return <GraduationCap className="w-5 h-5" />;
    case 'achievement':
      return <Star className="w-5 h-5" />;
  }
};

const getColorClass = (type: TimelineItem['type']) => {
  switch (type) {
    case 'work':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'education':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'achievement':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  }
};

export function Timeline() {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Minha Trajetória
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Uma linha do tempo das minhas experiências e conquistas.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-1/2 md:-translate-x-1/2 space-y-12">
        {timelineData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex flex-col md:flex-row items-start ${
              index % 2 === 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Timeline Dot */}
            <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-950 ${getColorClass(item.type)} z-10`}>
                {getIcon(item.type)}
              </div>
            </div>

            {/* Content Card */}
            <div className={`ml-10 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
                <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {item.organization}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
