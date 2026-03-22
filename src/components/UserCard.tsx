import { cn } from '@/lib/utils';

export interface UserCardProps {
  name: string;
  email: string;
  className?: string;
}

export function UserCard({ name, email, className }: UserCardProps) {
  return (
    <div className={cn("p-4 rounded-lg border border-slate-200 dark:border-slate-700", className)}>
      <h3 className="font-semibold text-slate-900 dark:text-white">{name}</h3>
      <p className="text-slate-600 dark:text-slate-400">{email}</p>
    </div>
  );
}