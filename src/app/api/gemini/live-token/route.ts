import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini Live não está configurado no servidor.' }, { status: 503 });
  }

  try {
    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });
    const now = new Date();
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now.getTime() + 60 * 1000).toISOString(),
      },
    });
    if (!token.name) {
      return NextResponse.json({ error: 'O provedor não retornou um token de sessão.' }, { status: 502 });
    }
    return NextResponse.json({ token: token.name, expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString() }, {
      headers: { 'Cache-Control': 'no-store, private' },
    });
  } catch (error) {
    console.error('Falha ao emitir token Gemini Live:', error instanceof Error ? error.message : 'erro desconhecido');
    return NextResponse.json({ error: 'Não foi possível iniciar uma sessão Gemini Live.' }, { status: 502 });
  }
}
