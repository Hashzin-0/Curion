import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { LIVE_MODEL } from '@/lib/gemini/live-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_ISSUANCES_PER_WINDOW = 5;
const issuanceByIp = new Map<string, { count: number; resetAt: number }>();

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

function allowIssuance(request: NextRequest): boolean {
  const now = Date.now();
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = request.headers.get('x-real-ip') || forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const current = issuanceByIp.get(ip);

  if (!current || current.resetAt <= now) {
    if (issuanceByIp.size > 2_000) {
      for (const [key, value] of issuanceByIp) {
        if (value.resetAt <= now) issuanceByIp.delete(key);
      }
    }
    issuanceByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
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

  if (!allowIssuance(request)) {
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
