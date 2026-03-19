
-- 1. Atualizar a tabela de usuários para suporte a Audio Bio e Status
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'open',
ADD COLUMN IF NOT EXISTS audio_bio_path TEXT,
ADD COLUMN IF NOT EXISTS audio_bio_hash TEXT;

-- 2. Garantir que o bucket 'uploads' exista e seja público
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Configurar Políticas de Segurança (RLS) para o Storage
-- Permitir que qualquer pessoa veja os áudios e imagens
CREATE POLICY "Acesso Público para Leitura"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'uploads' );

-- Permitir que usuários logados façam upload
CREATE POLICY "Upload para Usuários Autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'uploads' );

-- Permitir que o dono delete seu próprio arquivo
CREATE POLICY "Dono pode deletar seus arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'uploads' AND (select auth.uid()) = owner );
