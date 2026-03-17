'use server';
/**
 * @fileOverview Fluxo de IA para curadoria de currículo baseada em requisitos de vaga.
 * Seleciona os itens mais relevantes de um perfil para uma oportunidade específica.
 */

import { z } from 'zod';
import { askAI } from '../openrouter';

const MatchOutputSchema = z.object({
  selectedExperienceIds: z.array(z.string()).describe('Lista de IDs das experiências mais relevantes.'),
  selectedEducationIds: z.array(z.string()).describe('Lista de IDs das formações mais relevantes.'),
  selectedSkillIds: z.array(z.string()).describe('Lista de IDs das competências mais relevantes.'),
  selectedPortfolioIds: z.array(z.string()).describe('Lista de IDs dos projetos de portfólio mais relevantes.'),
  tailoredSummary: z.string().describe('Um resumo profissional customizado para esta vaga específica (letras maiúsculas).'),
  tailoredHeadline: z.string().describe('Um título profissional customizado para esta vaga.'),
});

export type MatchResult = z.infer<typeof MatchOutputSchema>;

export async function matchJobRequirements(input: {
  jobDescription: string;
  profile: any;
}): Promise<MatchResult> {
  return askAI({
    system: "Você é um especialista em recrutamento e seleção (Tech Recruiter). Sua tarefa é analisar uma vaga e o perfil de um candidato, selecionando APENAS as partes do perfil que dão match com a vaga para criar um currículo ultra-personalizado.",
    prompt: `DESCRIÇÃO DA VAGA:\n${input.jobDescription}\n\nPERFIL DO CANDIDATO (JSON):\n${JSON.stringify(input.profile)}\n\nCom base na vaga, retorne os IDs dos itens que DEVEM aparecer no currículo. Priorize qualidade sobre quantidade. Crie também um resumo executivo customizado de 3 linhas em LETRAS MAIÚSCULAS que conecte o perfil do candidato com as dores da vaga.`,
    schema: MatchOutputSchema
  });
}
