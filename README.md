<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Curion X — AI Resume & Profile Generator

A Next.js 15 app that generates themed resumes and animated profile pages using AI.

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Auth**: Supabase Auth (Google OAuth)
- **AI**: Google Genkit with OpenRouter via genkitx-openai plugin
- **State**: Zustand
- **Animations**: Framer Motion / Motion
- **PDF Export**: html2pdf.js

## Key Features

- **Resume Builder** — AI picks colors, emojis and layout based on profession.
- **Public Profile** — Poster-style themed page showing all experiences auto-grouped.
- **AI Job Parsing** — Extract job data from images/PDFs using OpenRouter Vision.
- **Live Interview** — Realtime audio simulation for career preparation.

## Running

```bash
npm run dev   # http://localhost:5000 (bound to 0.0.0.0)
```