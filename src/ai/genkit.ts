/**
 * @fileOverview Configuração do Genkit com suporte ao OpenRouter via plugin OpenAI.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    // O plugin openAI é configurado para redirecionar chamadas ao OpenRouter
    openAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
});
