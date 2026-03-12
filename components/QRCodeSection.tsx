import { QRCodeSVG } from 'qrcode.react';
import { getTheme } from '@/styles/themes';

export default function QRCodeSection({ url, areaSlug }: { url: string, areaSlug: string }) {
  const theme = getTheme(areaSlug);

  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-3xl ${theme.bgLight} border ${theme.border}`}>
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
        <QRCodeSVG value={url} size={150} fgColor="#0f172a" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">Acesse a versão interativa</h3>
      <p className="text-slate-500 text-center text-sm max-w-xs">
        Escaneie o QR Code para ver este portfólio completo online, com mais detalhes e animações.
      </p>
    </div>
  );
}
