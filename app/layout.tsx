
import type {Metadata} from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { StoreInitializer } from '@/components/StoreInitializer';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryClientProvider } from '@/components/QueryClientProvider';
import 'simplebar-react/dist/simplebar.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerCanvas — Portfólio Inteligente',
  description: 'Seu currículo interativo e temático com IA',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300" suppressHydrationWarning>
        <NuqsAdapter>
          <QueryClientProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <AuthProvider>
                <StoreInitializer />
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                  <DarkModeToggle />
                </div>
                <Toaster position="top-center" richColors />
                {children}
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
