# AI Studio Applet

A Next.js 15 app with Supabase auth and AI features (Genkit with Google AI and OpenRouter).

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Auth**: Supabase Auth
- **AI**: Google Genkit with Google AI (Gemini) and OpenRouter (via genkitx-openai plugin)
- **State**: Zustand
- **Animations**: Framer Motion / Motion

## Key Structure

- `app/` - Next.js App Router pages
- `components/` - Shared React components
- `src/ai/` - Genkit AI configuration and flows
- `lib/` - Utilities (Supabase client, helpers)

## Running

```bash
npm run dev   # http://localhost:5000
```

## Required Environment Variables

Set these in the Replit Secrets panel:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `OPENROUTER_API_KEY` | OpenRouter API key (for AI features via OpenRouter) |
| `GEMINI_API_KEY` | Google Gemini API key (for Google AI features) |

## Replit Configuration

- Dev server runs on port 5000, bound to 0.0.0.0 for Replit preview compatibility
- Package manager: npm
