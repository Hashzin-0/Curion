-- Migration 006: SEO Fields and Meta
-- Campos SEO para o site pessoal

CREATE TABLE "seo_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid UNIQUE NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "meta_title" text,
  "meta_description" text,
  "meta_keywords" text[],
  "og_title" text,
  "og_description" text,
  "og_image_path" text,
  "twitter_handle" text,
  "twitter_card_type" text DEFAULT 'summary_large_image' CHECK (twitter_card_type IN ('summary', 'summary_large_image')),
  "canonical_url" text,
  "sitemap_priority" numeric(2,1) DEFAULT 0.8 CHECK (sitemap_priority BETWEEN 0 AND 1),
  "sitemap_frequency" text DEFAULT 'weekly' CHECK (sitemap_frequency IN ('daily', 'weekly', 'monthly')),
  "no_index" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "seo_configs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO configs são públicos para leitura." ON "seo_configs" FOR SELECT USING (true);
CREATE POLICY "Usuários gerenciam seus próprios SEO configs." ON "seo_configs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_seo_configs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_seo_configs_update
  BEFORE UPDATE ON "seo_configs"
  FOR EACH ROW EXECUTE PROCEDURE update_seo_configs_updated_at();

-- Trigger para criar seo_config automaticamente quando site_config é criado
CREATE OR REPLACE FUNCTION create_seo_config_on_site_config()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.seo_configs (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_site_config_created_seo
  AFTER INSERT ON "site_configs"
  FOR EACH ROW EXECUTE PROCEDURE create_seo_config_on_site_config();
