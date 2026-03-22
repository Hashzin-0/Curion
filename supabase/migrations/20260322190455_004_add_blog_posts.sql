-- Migration 004: Blog Posts
-- Posts do blog pessoal

CREATE TABLE "blog_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "title" text NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "excerpt" text,
  "ai_excerpt" text,
  "content" text,
  "category" text CHECK (category IN ('projetos', 'trajetoria', 'servicos', 'livre')),
  "tags" text[] DEFAULT '{}',
  "ai_tags" text[],
  "cover_image_path" text,
  "reading_time" integer,
  "is_published" boolean DEFAULT false,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts publicados são públicos para leitura." ON "blog_posts" FOR SELECT USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam seus próprios posts." ON "blog_posts" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Função para gerar slug automaticamente
CREATE OR REPLACE FUNCTION generate_blog_slug(title text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Remove acentos e caracteres especiais, converte para lowercase
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := trim(regexp_replace(base_slug, '\s+', '-', 'g'));
  base_slug := substring(base_slug, 1, 100);
  
  -- Verifica se slug já existe
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at e published_at
CREATE OR REPLACE FUNCTION update_blog_posts_timestamps()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_blog_posts_update
  BEFORE UPDATE ON "blog_posts"
  FOR EACH ROW EXECUTE PROCEDURE update_blog_posts_timestamps();
