'use server';

/**
 * @fileOverview Fluxo de IA multimodal para extrair dados estruturados de panfletos ou PDFs de vagas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ParseJobOutputSchema = z.object({
  title: z.string().describe('O cargo da vaga.'),
  company: z.string().describe('O nome da empresa contratante.'),
  description: z.string().describe('Breve descrição das atividades.'),
  requirements: z.array(z.string()).describe('Lista de requisitos ou diferenciais.'),
  location: z.string().describe('Cidade/Bairro ou Indicação de Remoto.'),
  salary: z.string().optional().describe('Remuneração se mencionada.'),
  contactInfo: z.string().describe('E-mail, WhatsApp ou endereço para envio de currículo.'),
  areaSlug: z.string().describe('Slug da área (ex: gastronomia, tecnologia, saude, vendas, administrativo).'),
});

export type ParsedJob = z.infer<typeof ParseJobOutputSchema>;

const prompt = ai.definePrompt({
  name: 'parseJobPrompt',
  input: { schema: z.object({ mediaUrl: z.string() }) },
  output: { schema: ParseJobOutputSchema },
  // Utilizamos o modelo gemini-1.5-flash por ser excelente em visão computacional e OCR
  config: {
    model: googleAI.model('gemini-1.5-flash'),
  },
  prompt: `Você é um assistente de recrutamento especializado em extração de dados. 
Analise a imagem ou documento anexo (panfleto de vaga de emprego) e extraia todos os detalhes de forma estruturada.

INSTRUÇÕES:
1. Identifique o cargo principal.
2. Identifique a empresa (procure no topo ou logos).
3. Liste os requisitos ponto a ponto.
4. Extraia o contato (E-mail ou WhatsApp).
5. Mapeie para um dos slugs: gastronomia, tecnologia, saude, beleza, logistica, vendas, limpeza, seguranca, educacao, design, construcao, administrativo.

Documento: {{media url=mediaUrl}}`,
});

export async function parseJobFile(dataUri: string): Promise<ParsedJob> {
  const { output } = await prompt({ mediaUrl: dataUri });
  if (!output) throw new Error('Falha ao extrair dados da vaga. Verifique a qualidade da imagem.');
  return output;
}
