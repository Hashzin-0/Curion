-- 1. Ativar Extensão de Vetores para Busca Semântica
create extension if not exists vector;

-- 2. Expandir a tabela Users para suporte a Cache de Áudio e Embeddings
alter table public.users 
add column if not exists audio_bio_path text,
add column if not exists audio_bio_hash text,
add column if not exists embedding vector(768); -- DNA Profissional (Google text-embedding-04)

-- 3. Suporte a Proof of Work (Trajetória Imutável)
alter table public.projects
add column if not exists verification_hash text,
add column if not exists verified_at timestamptz;

-- 4. Motor de Busca por Similaridade de Cosseno (Inteligência IA)
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
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    u.id,
    u.name,
    u.username,
    u.headline,
    u.summary,
    u.avatar_path,
    1 - (u.embedding <=> query_embedding) as similarity
  from users u
  where 1 - (u.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;

-- 5. Garantir existência do bucket de uploads
insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', true)
on conflict (id) do nothing;
