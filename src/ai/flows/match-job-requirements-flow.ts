'use server';
/**
 * @fileOverview Fluxo de IA para curadoria de currículo baseada em requisitos de vaga.
 * Seleciona os itens mais relevantes de um perfil e gera guia de entrevista.
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
  interviewQuestions: z.array(z.object({
    question: z.string().describe('A pergunta que o recrutador pode fazer.'),
    advice: z.string().describe('Dica de como responder baseando-se no perfil do usuário.')
  })).describe('Lista de perguntas prováveis para entrevista baseadas na vaga e perfil.')
});

export type MatchResult = z.infer<typeof MatchOutputSchema>;

export async function matchJobRequirements(input: {
  jobDescription: string;
  profile: any;
}): Promise<MatchResult> {
  return askAI({
    system: "Você é um especialista em recrutamento e seleção (Tech Recruiter). Sua tarefa é analisar uma vaga e o perfil de um candidato, selecionando as partes do perfil que dão match com a vaga e gerando um guia de preparação para a entrevista.",
    prompt: `DESCRIÇÃO DA VAGA:\n${input.jobDescription}\n\nPERFIL DO CANDIDATO (JSON):\n${JSON.stringify(input.profile)}\n\nCom base na vaga, retorne os IDs dos itens que DEVEM aparecer no currículo. Crie também um resumo executivo customizado em LETRAS MAIÚSCULAS. Além disso, gere 5 perguntas prováveis que o recrutador faria a este candidato especificamente para esta vaga, com dicas de como ele deve responder usando suas experiências reais.`,
    schema: MatchOutputSchema
  });
}
