import { User } from '@/lib/store';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

export default function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="relative w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-md">
        <Image
          src={user.photo_url}
          alt={user.name}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.name}</h1>
        <h2 className="text-xl text-slate-600 mb-4 font-medium">{user.headline}</h2>
        <p className="text-slate-500 mb-4 max-w-2xl leading-relaxed">{user.summary}</p>
        <div className="flex items-center justify-center md:justify-start text-slate-400 text-sm font-medium">
          <MapPin className="w-4 h-4 mr-1" />
          {user.location}
        </div>
      </div>
    </div>
  );
}
