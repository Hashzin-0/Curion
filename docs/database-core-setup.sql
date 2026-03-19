-- 1. Ativar extensão pgvector para Busca Semântica
create extension if not exists vector;

-- 2. Atualizar tabela de usuários para suportar Cache de Áudio e Embeddings (IA)
alter table public.users add column if not exists audio_bio_path text;
alter table public.users add column if not exists audio_bio_hash text;
alter table public.users add column if not exists embedding vector(768);

-- 3. Atualizar tabela de projetos para suportar Proof of Work (Integridade)
alter table public.projects add column if not exists verification_hash text;
alter table public.projects add column if not exists verified_at timestamp with time zone;

-- 4. Função de Busca Semântica por Similaridade de Cosseno
create or replace function match_profiles (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  username text,
  headline text,
  summary text,
  avatar_path text,
  location text,
  availability_status text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    users.id,
    users.name,
    users.username,
    users.headline,
    users.summary,
    users.avatar_path,
    users.location,
    users.availability_status,
    1 - (users.embedding <=> query_embedding) as similarity
  from users
  where 1 - (users.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;