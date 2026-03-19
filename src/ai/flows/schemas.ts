import { z } from 'zod';

export const profissionalSummarySchema = z.object({
    summary: z.string().describe("O resumo profissional gerado."),
    top_skills: z.array(z.string()).describe("As 5 principais competências usadas para construir o resumo.")
});