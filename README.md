<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCFE7?logo=supabase)](https://supabase.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-764ABC?logo=zustand)](https://zustand-demo.surge.sh)
</div>

# Curion X — Seu currículo e perfil profissional em minutos

A Next.js 15 app that generates themed resumes and animated profile pages.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Supabase Auth (Google OAuth)
- **AI**: Google Genkit with OpenRouter
- **State**: Zustand
- **Animations**: Framer Motion / Motion
- **PDF**: @react-pdf/renderer, html2pdf.js

## Features

- **Resume Builder** — Crie currículos com cores, emojis e layout personalizados por área de atuação.
- **Public Profile** — Página temática estilo pôster com todas as experiências organizadas automaticamente.
- **AI Job Parsing** — Extraia dados de vagas de imagens/PDFs usando OpenRouter Vision.
- **Live Interview** — Simulação de entrevista em tempo real para preparação de carreira.
- **PDF Export** — Exporte seu currículo em PDF de alta qualidade.
- **Shareable Profiles** — Crie e compartilhe perfis públicos professionais.
- **Live Editor** — Editor WYSIWYG para customizar seu currículo em tempo real.
- **Templates** — Diversos templates de currículo para diferentes perfis profissionais.

## Getting Started

### Prerequisites

- Node.js 18+
- npm ou yarn

### Installation

```bash
git clone https://github.com/your-org/curion.git
cd curion
npm install
```

### Environment Variables

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter (AI)
OPENROUTER_API_KEY=your_openrouter_api_key

# Google Genkit
GOOGLE_GENERATIVE_API_KEY=your_google_api_key
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Inicia o servidor de desenvolvimento (http://localhost:5000) |
| `npm run build` | Faz o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o linter |
| `npm run clean` | Limpa cache do Next.js |

## Roadmap

- [ ] Mais templates de currículo
- [ ] Integração com LinkedIn API
- [ ] Editor de fotos integrado
- [ ] Histórico de versões
- [ ] Mode escuro melhorado
- [ ] PWA support
- [ ] Multi-idioma

## Contributing

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## License

MIT License - sinta-se livre para usar este projeto.