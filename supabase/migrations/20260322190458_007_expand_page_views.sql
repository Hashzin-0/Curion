-- Migration 007: Enhanced Page Views for Analytics
-- Expande a tabela de page_views para suportar analytics por seção

ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "page_url" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "section_viewed" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "cta_clicked" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "referrer" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "device_type" text CHECK (device_type IN ('desktop', 'mobile', 'tablet'));
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "city" text;

-- Índice para queries de analytics
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON "page_views"(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON "page_views"(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_section ON "page_views"(section_viewed);
CREATE INDEX IF NOT EXISTS idx_page_views_cta ON "page_views"(cta_clicked);

-- View para analytics agregados
CREATE OR REPLACE VIEW "analytics_summary" AS
SELECT 
  user_id,
  DATE(viewed_at) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT viewer_ip_hash) as unique_visitors,
  COUNT(CASE WHEN section_viewed IS NOT NULL THEN 1 END) as section_views,
  COUNT(CASE WHEN cta_clicked IS NOT NULL THEN 1 END) as cta_clicks
FROM page_views
GROUP BY user_id, DATE(viewed_at)
ORDER BY date DESC;

-- View para seção mais vista por usuário
CREATE OR REPLACE VIEW "section_analytics" AS
SELECT 
  user_id,
  section_viewed,
  COUNT(*) as views,
  COUNT(DISTINCT viewer_ip_hash) as unique_visitors
FROM page_views
WHERE section_viewed IS NOT NULL
GROUP BY user_id, section_viewed;

-- View para CTR dos CTAs
CREATE OR REPLACE VIEW "cta_analytics" AS
SELECT 
  user_id,
  cta_clicked,
  COUNT(*) as clicks,
  COUNT(DISTINCT viewer_ip_hash) as unique_clickers
FROM page_views
WHERE cta_clicked IS NOT NULL
GROUP BY user_id, cta_clicked;

-- Políticas para as views
CREATE POLICY "Usuários veem seus próprios analytics." ON "analytics_summary" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários veem seus próprios section analytics." ON "section_analytics" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários veem seus próprios CTA analytics." ON "cta_analytics" FOR SELECT USING (auth.uid() = user_id);
