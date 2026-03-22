-- Migration 002: Section Configurations
-- Configurações individuais de cada seção do site

CREATE TABLE "section_configs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "section_key" text NOT NULL CHECK (section_key IN (
    'hero', 'experiences', 'services_intro', 'services', 'projects',
    'trajectory', 'education', 'skills', 'certifications', 'languages',
    'blog', 'links', 'recommendations', 'volunteer', 'publications'
  )),
  "is_enabled" boolean DEFAULT true,
  "override_mode" text DEFAULT 'auto' CHECK (override_mode IN ('auto', 'forced_on', 'forced_off')),
  "custom_summary" text,
  "sort_order" integer DEFAULT 0,
  "section_settings" jsonb DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE("user_id", "section_key")
);

ALTER TABLE "section_configs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Section configs são públicos para leitura." ON "section_configs" FOR SELECT USING (true);
CREATE POLICY "Usuários gerenciam seus próprios section configs." ON "section_configs" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_section_configs_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_section_configs_update
  BEFORE UPDATE ON "section_configs"
  FOR EACH ROW EXECUTE PROCEDURE update_section_configs_updated_at();
