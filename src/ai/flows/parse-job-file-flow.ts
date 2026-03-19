'use server';

/**
 * @fileOverview Fluxo de IA via OpenRouter para extrair dados estruturados de anúncios de vagas (Vision).
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

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

export async function parseJobFile(dataUri: string): Promise<ParsedJob> {
  return askAI({
    system: "Você é um assistente de recrutamento especializado em extração de dados visuais de panfletos e anúncios de emprego. Sua tarefa é ler a imagem e organizar os dados.",
    prompt: `Analise esta imagem de anúncio de vaga e extraia as informações estruturadas. 
    INSTRUÇÕES IMPORTANTES:
    1. Identifique o cargo principal.
    2. Identifique a empresa.
    3. Procure por números de WhatsApp ou e-mails para contato.
    4. Mapeie a área para um dos slugs: gastronomia, tecnologia, saude, beleza, logistica, vendas, limpeza, seguranca, educacao, design, construcao, administrativo.`,
    imageUri: dataUri,
    schema: ParseJobOutputSchema
  });
}
