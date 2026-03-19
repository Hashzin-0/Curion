
import { NextRequest, NextResponse } from 'next/server';
import { generateTextEmbedding } from '@/ai/flows/generate-embedding-flow';
import { supabase } from '@/lib/supabase';

/**
 * @fileOverview API para sincronizar o vetor de busca do perfil.
 * Deve ser chamada sempre que o perfil for editado.
 */

export async function POST(req: NextRequest) {
  try {
    const { userId, text } = await req.json();

    if (!userId || !text) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    // 1. Gerar o vetor matemático do perfil
    const vector = await generateTextEmbedding(text);

    // 2. Atualizar no banco de dados
    const { error } = await supabase
      .from('users')
      .update({ embedding: vector })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao sincronizar embedding:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
