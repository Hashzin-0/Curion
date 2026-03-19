
-- 1. Habilitar a extensão de vetores
create extension if not exists vector;

-- 2. Adicionar coluna de embedding na tabela de usuários
-- O modelo text-embedding-004 da Google gera vetores de 768 dimensões
alter table public.users add column if not exists embedding vector(768);

-- 3. Criar índice HNSW para buscas ultra-rápidas
create index on users using hnsw (embedding vector_cosine_ops);

-- 4. Função RPC para busca por similaridade
-- Esta função será chamada pelo DatabaseService para encontrar candidatos
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
  order by users.embedding <=> query_embedding
  limit match_count;
end;
$$;
