'use client';

import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { QueryClientProvider } from '@/components/QueryClientProvider';
import { StoreInitializer } from '@/components/StoreInitializer';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Curion X — Portfólio Inteligente</title>
        <meta name="description" content="Sua carreira organizada com inteligência artificial. Currículos temáticos, exportação PDF e Hub de vagas." />
      </head>
      <body className="antialiased font-sans">
        <NuqsAdapter>
          <QueryClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthProvider>
                <StoreInitializer />
                {children}
                <Toaster position="top-center" richColors />
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}