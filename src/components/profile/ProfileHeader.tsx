'use client';

import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileHeader({ 
  activeTab, 
  setActiveTab, 
  copyProfileLink, 
  copied, 
  username, 
  router 
}: any) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="fixed top-4 left-4 z-20 flex items-center gap-2">
      <Button variant="secondary" onClick={() => router.push(`/${username}`)}>Ver Perfil</Button>
      <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase transition-all", activeTab === 'profile' ? "bg-white text-slate-900 shadow-lg" : "text-white/70")}
        >
          Perfil
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase transition-all", activeTab === 'analytics' ? "bg-white text-slate-900 shadow-lg" : "text-white/70")}
        >
          Métricas
        </button>
      </div>
      <Button variant={copied ? 'accent' : 'secondary'} className={copied ? 'bg-emerald-500 text-white' : ''} onClick={copyProfileLink}>
        {copied ? <LucideIcons.Check size={16} /> : <LucideIcons.Copy size={16} />}
        {copied ? 'Copiado' : 'Link'}
      </Button>
      <Button variant="danger" onClick={handleSignOut}>Sair</Button>
    </div>
  );
}