-- Migration 001: Site Configuration
-- Configuração global do site pessoal do usuário

CREATE TABLE "site_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid UNIQUE NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "template_key" text DEFAULT 'freelancer' CHECK (template_key IN ('freelancer', 'dev', 'designer', 'writer', 'artist')),
  "sections_order" jsonb DEFAULT '["hero", "experiences", "services_intro", "services", "projects", "trajectory", "education", "skills", "certifications", "languages", "blog", "links"]',
  "theme_settings" jsonb DEFAULT '{"primaryColor": "#3b82f6", "accentColor": "#10b981", "fontFamily": "Inter", "bgColor": "#ffffff", "textColor": "#1f2937"}',
  "site_title" text,
  "site_description" text,
  "og_image_path" text,
  "is_published" boolean DEFAULT false,
  "auditor_score" integer,
  "auditor_data" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "site_configs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site configs são públicos para leitura." ON "site_configs" FOR SELECT USING (true);
CREATE POLICY "Usuários gerenciam seus próprios site configs." ON "site_configs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_site_configs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_site_configs_update
  BEFORE UPDATE ON "site_configs"
  FOR EACH ROW EXECUTE PROCEDURE update_site_configs_updated_at();

-- Trigger para criar site_config automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION create_site_config_on_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.site_configs (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_site_config
  AFTER INSERT ON "users"
  FOR EACH ROW EXECUTE PROCEDURE create_site_config_on_user();
