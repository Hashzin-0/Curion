-- Migration 005: External Sites
-- Links para blogs externos e redes sociais

CREATE TABLE "external_sites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "url" text NOT NULL,
  "description" text,
  "icon" text DEFAULT 'Link',
  "is_active" boolean DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "external_sites" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "External sites são públicos para leitura quando ativos." ON "external_sites" FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam seus próprios external sites." ON "external_sites" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_external_sites_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_external_sites_update
  BEFORE UPDATE ON "external_sites"
  FOR EACH ROW EXECUTE PROCEDURE update_external_sites_updated_at();
