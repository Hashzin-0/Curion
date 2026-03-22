-- Migration 008: Storage Buckets
-- Buckets de storage para blog e serviços

-- Bucket para capas de posts do blog
INSERT INTO storage.buckets (id, name, public) VALUES ('blog_covers', 'blog_covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Capas de blog são públicas." ON storage.objects
FOR SELECT USING (bucket_id = 'blog_covers');

CREATE POLICY "Usuários gerenciam suas próprias capas de blog." ON storage.objects
FOR ALL USING (bucket_id = 'blog_covers' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'blog_covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket para capas de serviços
INSERT INTO storage.buckets (id, name, public) VALUES ('service_covers', 'service_covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Capas de serviços são públicas." ON storage.objects
FOR SELECT USING (bucket_id = 'service_covers');

CREATE POLICY "Usuários gerenciam suas próprias capas de serviços." ON storage.objects
FOR ALL USING (bucket_id = 'service_covers' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'service_covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket para OG images
INSERT INTO storage.buckets (id, name, public) VALUES ('og_images', 'og_images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "OG images são públicas." ON storage.objects
FOR SELECT USING (bucket_id = 'og_images');

CREATE POLICY "Usuários gerenciam suas próprias OG images." ON storage.objects
FOR ALL USING (bucket_id = 'og_images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'og_images' AND auth.uid()::text = (storage.foldername(name))[1]);
