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

-- Índices para queries de analytics
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON "page_views"(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON "page_views"(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_section ON "page_views"(section_viewed);
CREATE INDEX IF NOT EXISTS idx_page_views_cta ON "page_views"(cta_clicked);
CREATE INDEX IF NOT EXISTS idx_page_views_ip ON "page_views"(viewer_ip_hash);
