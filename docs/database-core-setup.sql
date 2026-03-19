-- @fileOverview Configuração base do banco de dados para Curion X.
-- Inclui: Busca Semântica (Vector), Cache de Áudio MD5 e Proof of Work.

-- 1. Ativar Extensão de Vetores
create extension if not exists vector;

-- 2. Atualizar tabela de usuários
alter table public.users 
add column if not exists audio_bio_path text,
add column if not exists audio_bio_hash text,
add column if not exists embedding vector(768);

-- 3. Campos para Proof of Work na tabela de projetos
alter table public.projects
add column if not exists verification_hash text,
add column if not exists verified_at timestamptz;

-- 4. Função de Busca Semântica (Similaridade de Cosseno)
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

-- 5. Configuração do Storage
insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', true)
on conflict (id) do nothing;