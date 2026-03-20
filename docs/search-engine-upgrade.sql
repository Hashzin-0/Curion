-- 1. Adicionar suporte a busca vetorial na tabela de vagas
alter table public.jobs add column if not exists embedding vector(768);

-- 2. Motor de Busca de Vagas por Similaridade (Inteligência IA)
create or replace function match_jobs (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  company text,
  description text,
  requirements text[],
  location text,
  salary text,
  contact_info text,
  area_slug text,
  regime text,
  work_model text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    j.id,
    j.title,
    j.company,
    j.description,
    j.requirements,
    j.location,
    j.salary,
    j.contact_info,
    j.area_slug,
    j.regime,
    j.work_model,
    1 - (j.embedding <=> query_embedding) as similarity
  from jobs j
  where 1 - (j.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;