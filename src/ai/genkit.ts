'use client';
/**
 * @fileOverview Configuração inicial do Genkit para o cliente.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
});
