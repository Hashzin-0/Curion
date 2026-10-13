import { Type } from '@google/genai';

export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-latest';
export const LIVE_VOICE = 'Kore';

export const LIVE_ALLOWED_ROUTES = {
  home: '/',
  profile: '/profile',
  interview: '/interview',
  explore: '/explore',
} as const;

export type LivePage = keyof typeof LIVE_ALLOWED_ROUTES;

export const LIVE_TOOL_DECLARATIONS = [
  {
    name: 'navigate_to_page',
    description: 'Navigate the user to a supported Curion page. Only use after the user explicitly asks to open or navigate to a page.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: {
          type: Type.STRING,
          enum: Object.keys(LIVE_ALLOWED_ROUTES),
          description: 'The destination page: home, profile, interview, or explore.',
        },
      },
      required: ['page'],
    },
  },
  {
    name: 'get_site_help',
    description: 'Explain how to use a confirmed Curion feature. This tool does not read or change private user data.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        topic: {
          type: Type.STRING,
          enum: ['profile', 'interview', 'explore', 'resume', 'jobs'],
          description: 'The feature the user wants help with.',
        },
      },
      required: ['topic'],
    },
  },
] as const;

export const LIVE_VOICE_TOOL_GUIDANCE: Record<string, string> = {
  profile: 'O perfil profissional é a área central do Curion para organizar informações profissionais e acessar a experiência de currículo/perfil. Revise os dados antes de compartilhar qualquer perfil público.',
  interview: 'O simulador de entrevista fica em /interview. Inicie a sessão, permita o acesso ao microfone e responda oralmente às perguntas do recrutador. Encerre a sessão para ver a análise disponível.',
  explore: 'A área Explore fica em /explore e é voltada à exploração de conteúdo e recursos de IA do Curion.',
  resume: 'O Curion inclui criação e personalização de currículos e exportação em PDF. Abra o perfil para localizar o fluxo de currículo disponível na versão atual do site.',
  jobs: 'O Curion documenta recursos relacionados a vagas, incluindo extração de dados de vagas. Para evitar abrir uma rota inexistente, use o perfil ou a área Explore para localizar o recurso disponível na versão atual.',
};
