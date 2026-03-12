import { User } from '@/lib/store';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

export default function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="relative w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-white dark:border-slate-800 shadow-md">
        <Image
          src={user.photo_url}
          alt={user.name}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>
        <h2 className="text-xl text-slate-600 dark:text-slate-400 mb-4 font-medium">{user.headline}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-2xl leading-relaxed">{user.summary}</p>
        <div className="flex items-center justify-center md:justify-start text-slate-400 dark:text-slate-500 text-sm font-medium">
          <MapPin className="w-4 h-4 mr-1" />
          {user.location}
        </div>
      </div>
    </div>
  );
}
