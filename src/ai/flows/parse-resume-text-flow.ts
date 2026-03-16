
'use server';
/**
 * @fileOverview Fluxo de IA para extrair dados estruturados de texto bruto de currículos.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const ParseResumeOutputSchema = z.object({
  name: z.string().optional(),
  profession: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  experiences: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string()
  })).optional(),
  education: z.array(z.object({
    institution: z.string(),
    course: z.string(),
    period: z.string()
  })).optional(),
  skills: z.array(z.object({
    name: z.string(),
    description: z.string()
  })).optional(),
});

export type ParsedResume = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResumeText(input: { text: string }): Promise<ParsedResume> {
  return askAI({
    system: "Você é um extrator de dados de currículos. Sua tarefa é analisar o texto bruto extraído de um PDF ou foto e organizar as informações no formato JSON solicitado.",
    prompt: `Texto extraído do currículo:\n\n${input.text}\n\nExtraia o máximo de informações possível: nome completo, profissão principal, e-mail, telefone, resumo profissional, lista de experiências (empresa, cargo, período), formação acadêmica (instituição, curso, período) e habilidades técnicas.`,
    schema: ParseResumeOutputSchema
  });
}
