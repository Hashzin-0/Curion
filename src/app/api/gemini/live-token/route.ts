import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { LIVE_MODEL } from '@/lib/gemini/live-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_ISSUANCES_PER_WINDOW = 5;
const issuanceByUser = new Map<string, { count: number; resetAt: number }>();

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;

  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function allowIssuance(userId: string): boolean {
  const now = Date.now();
  const current = issuanceByUser.get(userId);

  if (!current || current.resetAt <= now) {
    if (issuanceByUser.size > 2_000) {
      for (const [key, value] of issuanceByUser) {
        if (value.resetAt <= now) issuanceByUser.delete(key);
      }
    }
    issuanceByUser.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_ISSUANCES_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origem da solicitação não permitida.' }, { status: 403 });
  }

  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!accessToken || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Entre na sua conta para iniciar uma sessão de voz.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return NextResponse.json(
      { error: 'Sua sessão expirou. Entre novamente para usar o assistente de voz.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }

  if (!allowIssuance(authData.user.id)) {
    return NextResponse.json(
      { error: 'Muitas tentativas de iniciar voz. Aguarde um minuto e tente novamente.' },
      { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store, private' } },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini Live não está configurado no servidor.' },
      { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }

  try {
    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1beta' } });
    const now = Date.now();
    const expiresAt = new Date(now + 30 * 60 * 1000).toISOString();
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: expiresAt,
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: {
            responseModalities: ['AUDIO'],
          },
        },
      },
    });

    if (!token.name) {
      return NextResponse.json(
        { error: 'O provedor não retornou um token de sessão.' },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }

    return NextResponse.json(
      { token: token.name, expiresAt },
      { headers: { 'Cache-Control': 'no-store, private', Pragma: 'no-cache' } },
    );
  } catch (error) {
    console.error(
      'Falha ao emitir token Gemini Live:',
      error instanceof Error ? error.message : 'erro desconhecido',
    );
    return NextResponse.json(
      { error: 'Não foi possível iniciar uma sessão Gemini Live.' },
      { status: 502, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }
}
