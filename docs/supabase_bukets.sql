-- 1. CRIAÇÃO DOS BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
    ('portfolio', 'portfolio', true)
    ON CONFLICT (id) DO NOTHING;

    -- 2. REGRAS PARA O BUCKET 'AVATARS'
    -- Qualquer um pode ver fotos de perfil
    CREATE POLICY "Avatares públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

    -- Apenas o dono pode subir/editar sua própria foto na sua pasta
    CREATE POLICY "Upload de avatar próprio" ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

    CREATE POLICY "Gestão de avatar próprio" ON storage.objects FOR ALL TO authenticated 
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

    -- 3. REGRAS PARA O BUCKET 'PORTFOLIO'
    -- Qualquer um pode ver arquivos do portfólio (currículos, etc)
    CREATE POLICY "Portfólio público" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');

    -- Apenas o dono gerencia sua pasta de portfólio
    CREATE POLICY "Upload de portfólio próprio" ON storage.objects FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

    CREATE POLICY "Gestão de portfólio próprio" ON storage.objects FOR ALL TO authenticated 
    USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);