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

- **Themed Resume Generator** (`/resume`) — 4-step wizard; AI picks colors, emojis and summary based on profession; exports PDF
- **Themed Profile Pages** (`/[username]`) — Public profile with AI-generated hero gradient, floating emojis, thematic area cards
- **Private Dashboard** (`/profile`) — Edit profile, manage professional areas, add timeline items
- **Area Curriculum** (`/[username]/[areaSlug]`) — Area-specific resume view

## AI Flows (`src/ai/flows/`)

| Flow | Model | Purpose |
|---|---|---|
| `generate-resume-theme-flow.ts` | `stepfun/step-3.5-flash:free` | Generates colors, emojis, summary for PDF resumes |
| `generate-profile-theme-flow.ts` | `stepfun/step-3.5-flash:free` | Generates hero gradient, floating emojis, tagline for profile pages |
| `generate-summary-flow.ts` | `stepfun/step-3.5-flash:free` | Generates professional summary text |

## Key Components

- `components/ThemedProfileLayout.tsx` — Animated profile layout with hero, floating emojis, themed area cards
- `components/ResumeTemplate.tsx` — PDF-ready resume template with dynamic theming
- `components/Stats.tsx` — Professional stats charts
- `components/Timeline.tsx` — Career timeline with add/edit support

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
