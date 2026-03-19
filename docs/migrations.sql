
-- ==============================================================================
-- MIGRATIONS CUMULATIVAS CURION X (V5 - PROOF OF WORK & BLOCKCHAIN SIMULATION)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. ATUALIZAÇÃO DE USUÁRIOS (CACHE DE ÁUDIO E BUSCA SEMÂNTICA)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS audio_bio_path TEXT,
ADD COLUMN IF NOT EXISTS audio_bio_hash TEXT,
ADD COLUMN IF NOT EXISTS embedding vector(768),
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'open';

-- 3. SISTEMA DE PROOF OF WORK (IMUTABILIDADE DE PROJETOS)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS verification_hash TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

COMMENT ON COLUMN public.projects.verification_hash IS 'Hash SHA-256 dos dados do projeto, simulando integridade de blockchain';

-- 4. FUNÇÃO DE BUSCA SEMÂNTICA (VETORES)
CREATE OR REPLACE FUNCTION match_profiles (
  query_embedding vector(768),
    match_threshold float,
      match_count int
      )
      RETURNS TABLE (
        id uuid,
          name text,
            username text,
              headline text,
                summary text,
                  similarity float
                  )
                  LANGUAGE plpgsql
                  AS $$
                  BEGIN
                    RETURN QUERY
                      SELECT
                          users.id,
                              users.name,
                                  users.username,
                                      users.headline,
                                          users.summary,
                                              1 - (users.embedding <=> query_embedding) AS similarity
                                                FROM users
                                                  WHERE 1 - (users.embedding <=> query_embedding) > match_threshold
                                                    ORDER BY similarity DESC
                                                      LIMIT match_count;
                                                      END;
                                                      $$;

                                                      -- 5. STORAGE CONFIG (POLÍTICAS PÚBLICAS PARA ÁUDIO E JOBS)
                                                      -- Nota: Execute estes comandos se os buckets ainda não existirem ou se precisar resetar permissões
                                                      INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO NOTHING;

                                                      CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
                                                      CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
                                                      