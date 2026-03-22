-- Migration 003: Services
-- Catálogo de serviços com preço e booking

CREATE TABLE "services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "description" text,
  "price" numeric(10,2),
  "currency" text DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  "price_type" text DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'project', 'contact')),
  "delivery_time" text,
  "booking_url" text,
  "packages" jsonb DEFAULT '[]',
  "is_active" boolean DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "cover_image_path" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services são públicos para leitura quando ativos." ON "services" FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "Usuários gerenciam seus próprios serviços." ON "services" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_services_update
  BEFORE UPDATE ON "services"
  FOR EACH ROW EXECUTE PROCEDURE update_services_updated_at();
