# CareerCanvas — AI Resume & Profile Generator

A Next.js 15 app that generates themed resumes and animated profile pages using AI.

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Auth**: Supabase Auth (Google OAuth)
- **AI**: Google Genkit with OpenRouter (`stepfun/step-3.5-flash:free`) via genkitx-openai plugin
- **State**: Zustand
- **Animations**: Framer Motion / Motion
- **PDF Export**: html2pdf.js

## Key Features

- **Resume Builder** (`/resume`) — Section picker UI; AI picks colors, emojis and layout based on profession; exports themed PDF
- **Public Profile** (`/[username]`) — Poster-style themed page showing all experiences auto-grouped by detected profession area. Each area has its own "Export PDF" button. QR Code footer.
- **Area Curriculum** (`/[username]/[areaSlug]`) — Area-specific detailed resume view with "Exportar Currículo Temático" button (AI-themed PDF export)
- **Private Dashboard** (`/profile`) — Edit profile, manage areas and experiences

## Auto-Area Grouping

The system auto-detects the professional area from an experience role using keyword matching (`lib/utils.ts → detectAreaFromRole`). No manual area selection needed. Supports 12+ categories: Gastronomia, Tecnologia, Saúde, Beleza, Logística, Vendas, Limpeza, Segurança, Educação, Design, Construção, Administrativo. Falls back to using the role itself as the area name.

The `store.addExperienceWithAutoArea()` action auto-creates the area if it doesn't exist.

## AI Flows (`src/ai/flows/`)

| Flow | Model | Purpose |
|---|---|---|
| `generate-resume-theme-flow.ts` | `stepfun/step-3.5-flash:free` | Generates colors, emojis, layout for PDF resumes (15+ profession categories) |
| `generate-profile-theme-flow.ts` | `stepfun/step-3.5-flash:free` | Generates hero gradient, floating emojis, tagline |
| `generate-summary-flow.ts` | `stepfun/step-3.5-flash:free` | Generates professional summary text |

## Resume Template Layouts

Two layouts in `components/ResumeTemplate.tsx`:
- **Vibrant** — Full-bleed colored header, emoji watermark (for Gastronomia, Beleza, Serviços...)
- **Sidebar** — Two-column with colored sidebar and photo (for Tecnologia, Saúde, Logística...)

AI selects the layout automatically based on profession.

## PDF Export Fix

PDF export uses `useEffect` pattern to guarantee the React DOM has fully committed before triggering `html2pdf.js`. The handler sets state + `setShouldExport(true)`, and the `useEffect` detects when all three (`shouldExport`, `exportTheme`, `exportData`) are ready, then runs the export. Uses `allowTaint: true` and `imageTimeout: 0` for base64 image support.

## Key Components

- `components/ResumeTemplate.tsx` — PDF-ready resume template (Vibrant + Sidebar layouts)
- `components/ThemedProfileLayout.tsx` — Original animated profile layout (kept for reference)
- `components/Stats.tsx` — Professional stats charts
- `components/Timeline.tsx` — Career timeline

## Theme System

`styles/themes.ts` maps area slugs to colors/emojis. Includes all auto-detected slugs (gastronomia, tecnologia, saude, beleza, logistica, vendas, limpeza, seguranca, educacao, design, construcao, administrativo + legacy slugs).

## API Routes

- `POST /api/resume/theme` — Generate resume theme from profession
- `POST /api/profile/theme` — Generate profile page theme from user data

## Required Environment Variables

Set in the Replit Secrets panel:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `OPENROUTER_API_KEY` | OpenRouter API key (all AI features) |

## Running

```bash
npm run dev   # http://localhost:5000 (bound to 0.0.0.0)
```
