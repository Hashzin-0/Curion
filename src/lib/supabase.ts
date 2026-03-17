import { createClient } from '@supabase/supabase-js';

/**
 * @fileOverview Inicialização do cliente Supabase com tratamento de erros robusto.
 * Garante que o app não quebre se as chaves estiverem ausentes ou forem strings vazias.
 */

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Limpa e valida as strings para evitar passar valores "falsy" ou strings de erro comuns
const cleanUrl = (rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null') ? rawUrl.trim() : '';
const cleanKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null') ? rawKey.trim() : '';

// Fallbacks seguros para evitar o erro "supabaseUrl is required" durante o build ou carregamento inicial
const supabaseUrl = cleanUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = cleanKey || 'placeholder-key';

if (!cleanUrl || !cleanKey) {
  console.warn(
    'Supabase: Variáveis de ambiente (URL ou Anon Key) não configuradas ou vazias. ' +
    'Funcionalidades de Autenticação e Banco de Dados não funcionarão corretamente até que sejam definidas.'
  );
}

// Inicializa o cliente com os valores validados ou placeholders
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
