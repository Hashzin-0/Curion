
'use client';

import { QRCodeWithLogo } from '@/components/ui/QRCodeWithLogo';
import { getTheme } from '@/styles/themes';
import { Sparkles } from 'lucide-react';

interface QRCodeSectionProps {
  url: string;
  areaSlug: string;
  logoUrl?: string | null;
}

export default function QRCodeSection({ url, areaSlug, logoUrl }: QRCodeSectionProps): React.ReactElement {
  const theme = getTheme(areaSlug);

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] ${theme.bgLight} border ${theme.border} relative overflow-hidden group`}>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
        <Sparkles size={120} className={theme.text} />
      </div>

      <div className="bg-white p-5 rounded-[2rem] shadow-xl mb-6 relative z-10 transform group-hover:scale-105 transition-transform duration-500">
        <QRCodeWithLogo 
          value={url} 
          size={160} 
          fgColor={theme.hexDark}
          level="H"
          marginSize={2}
          logoUrl={logoUrl}
        />
      </div>
      
      <div className="text-center relative z-10">
        <h3 className="text-xl font-black text-slate-900 mb-2">Portfolio Interativo</h3>
        <p className="text-slate-500 text-sm max-w-[240px] font-medium leading-relaxed">
          Escaneie para ver este currículo com animações e gráficos em tempo real.
        </p>
      </div>
    </div>
  );
}
