'use server'

/**
 * @fileOverview Fluxo de IA para gerar resumo profissional.
 * 
 * - generateProfessionalSummary - Gera um resumo atraente com base no perfil do usuário.
 */

import { z } from 'zod'
import { profissionalSummarySchema } from './schemas'
import { askAI } from '../openrouter';

const начальныеSoftSkills = [
    'Proatividade',
    'Comunicação Clara',
    'Trabalho em Equipe',
    'Adaptabilidade',
    'Resolução de Conflitos',
    'Pensamento Crítico',
    'Criatividade',
    'Liderança',
    'Gerenciamento do Tempo',
    'Inteligência Emocional',
    'Negociação',
    'Resiliência',
    'Empatia',
    'Escuta Ativa',
    'Capacidade de Persuasão',
    'Flexibilidade',
    'Visão Estratégica',
    'Inovação',
    'Foco no Cliente',
    'Mentalidade de Crescimento'
];

function shuffleAndSelect(arr: string[], count: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Gera um resumo profissional otimizado usando IA.
 */
export async function generateProfessionalSummary(
    {
        name,
        headline,
        experiences,
        education,
        skills
    }: {
        name: string,
        headline: string,
        experiences: { role: string, company: string, duration: string }[],
        education: { course: string, institution: string }[],
        skills: string[]
    }
) {
    const hasNoSkills = !skills || skills.length === 0;
    const selectedSkills = hasNoSkills ? shuffleAndSelect(начальныеSoftSkills, 5) : skills;

    const prompt = `
        O meu nome é ${name} e meu título profissional é ${headline}.

        Minhas experiências profissionais são:
        ${experiences.map(exp => `- ${exp.role} na ${exp.company} (${exp.duration})`).join('\n')}

        Minha formação é:
        ${education.map(edu => `- ${edu.course} em ${edu.institution}`).join('\n')}

        Minhas habilidades são: ${selectedSkills.join(', ')}.

        Com base nessas informações, crie um resumo profissional (em primeira pessoa) que seja atraente e conciso.
        O resumo deve ter no máximo 4 parágrafos curtos.
        ${hasNoSkills ? 'Como não tenho experiência, destaque minhas soft skills e meu potencial de crescimento.' : 'Destaque minhas principais competências e como elas se aplicam às minhas experiências.'}
        Sempre identifique e salve as 5 principais competências que você usou para construir o resumo.
    `;

    // Retorna diretamente o resultado do processamento da IA
    return await askAI({
        prompt,
        schema: profissionalSummarySchema,
        system: "Você é um especialista em recrutamento e seleção de alto nível. Seu objetivo é criar resumos profissionais impactantes."
    });
}
