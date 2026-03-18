--
-- Esquema Completo do Banco de Dados - Versão 3 (Final)
-- Este esquema foi revisado para incluir todas as tabelas e buckets de armazenamento necessários
-- para uma plataforma de portfólio profissional completa, segura e escalável.
--

-- Etapa 1: Limpeza do ambiente anterior (se existir)
-- A ordem é importante para evitar erros de chave estrangeira.
DROP TABLE IF EXISTS "page_views";
DROP TABLE IF EXISTS "area_skills";
DROP TABLE IF EXISTS "skills";
DROP TABLE IF EXISTS "recommendations";
DROP TABLE IF EXISTS "volunteer_experiences";
DROP TABLE IF EXISTS "publications";
DROP TABLE IF EXISTS "languages";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "certificates";
DROP TABLE IF EXISTS "portfolio_items";
DROP TABLE IF EXISTS "experiences";
DROP TABLE IF EXISTS "education";
DROP TABLE IF EXISTS "professional_areas";
DROP TABLE IF EXISTS "user_contacts";
DROP TABLE IF EXISTS "users";

-- Etapa 2: Tabela Principal de Usuários
-- Armazena o perfil público essencial, vinculado à autenticação do Supabase.
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT auth.uid() NOT NULL,
  "username" text UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  "name" text NOT NULL,
  "headline" text,
  "summary" text,
  "avatar_path" text, -- Caminho para o arquivo no bucket 'avatars'
  "location" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis públicos são visíveis por todos." ON "users" FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar seu próprio perfil." ON "users" FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil." ON "users" FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Etapa 3: Gatilho para Sincronização Automática de Usuários
-- Garante que um registro em 'users' seja criado quando um novo usuário se autentica.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, name, avatar_path)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Etapa 4: Tabelas de Conteúdo do Perfil
-- Todas as tabelas estão vinculadas ao 'user_id' com exclusão em cascata e políticas de segurança.

CREATE TABLE "user_contacts" (
  "user_id" uuid PRIMARY KEY REFERENCES "users"(id) ON DELETE CASCADE,
  "email" text CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  "phone" text,
  "website" text
);
ALTER TABLE "user_contacts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar seus próprios contatos." ON "user_contacts" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "professional_areas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "theme_color" text DEFAULT '#3b82f6',
  "order" integer DEFAULT 0
);
ALTER TABLE "professional_areas" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar suas áreas profissionais." ON "professional_areas" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "experiences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "area_id" uuid REFERENCES "professional_areas"(id) ON DELETE SET NULL,
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "role" text NOT NULL,
  "company_name" text NOT NULL,
  "start_date" date, "end_date" date,
  "description" text
);
ALTER TABLE "experiences" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar suas experiências." ON "experiences" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "education" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "institution" text NOT NULL,
  "course" text NOT NULL,
  "start_date" date, "end_date" date
);
ALTER TABLE "education" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar sua formação." ON "education" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "portfolio_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "file_path" text, -- Caminho no bucket 'user_documents'
  "external_url" text
);
ALTER TABLE "portfolio_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar seus itens de portfólio." ON "portfolio_items" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "certificates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "issuing_organization" text NOT NULL,
  "issue_date" date,
  "file_path" text -- Caminho no bucket 'user_documents'
);
ALTER TABLE "certificates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar seus certificados." ON "certificates" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "name" text NOT NULL, "description" text,
  "start_date" date, "end_date" date,
  "external_url" text
);
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar seus projetos." ON "projects" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "languages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "language_name" text NOT NULL,
  "proficiency" text NOT NULL -- Ex: Nativo, Fluente, Avançado, Intermediário, Básico
);
ALTER TABLE "languages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar seus idiomas." ON "languages" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "recommendations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "author_name" text NOT NULL,
  "author_headline" text NOT NULL,
  "content" text NOT NULL,
  "file_path" text -- Caminho para a carta original no bucket 'user_documents'
);
ALTER TABLE "recommendations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar suas cartas de recomendação." ON "recommendations" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "publications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "title" text NOT NULL,
  "publisher" text,
  "publication_date" date,
  "url" text,
  "description" text
);
ALTER TABLE "publications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar suas publicações." ON "publications" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "volunteer_experiences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "organization" text NOT NULL,
  "role" text NOT NULL,
  "start_date" date, "end_date" date,
  "description" text
);
ALTER TABLE "volunteer_experiences" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem gerenciar suas experiências voluntárias." ON "volunteer_experiences" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Etapa 5: Tabelas de Habilidades (Skills) e Analytics

CREATE TABLE "skills" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text UNIQUE NOT NULL,
  "icon" text DEFAULT 'Star'
);
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Habilidades são visíveis por todos." ON "skills" FOR SELECT USING (true);
CREATE POLICY "Apenas administradores podem adicionar novas habilidades globais." ON "skills" FOR INSERT WITH CHECK (false); -- Mude para uma role de admin no futuro

CREATE TABLE "area_skills" (
  "area_id" uuid NOT NULL REFERENCES "professional_areas"(id) ON DELETE CASCADE,
  "skill_id" uuid NOT NULL REFERENCES "skills"(id) ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  PRIMARY KEY (area_id, skill_id)
);
ALTER TABLE "area_skills" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem vincular habilidades às suas áreas." ON "area_skills" FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE "page_views" (
  "id" bigserial PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "viewer_ip_hash" text, -- Hash anônimo do IP
  "viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "page_views" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver as contagens de visualização de sua página." ON "page_views" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Permitir a inserção anônima de visualizações." ON "page_views" FOR INSERT WITH CHECK (true);

-- Etapa 6: Configuração do Supabase Storage (Buckets e Políticas)

-- Bucket para Avatares (fotos de perfil)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Proprietários podem gerenciar seus próprios avatares." ON storage.objects
FOR ALL USING (bucket_id = 'avatars' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Bucket para todos os outros documentos do usuário (privado e organizado por user_id)
INSERT INTO storage.buckets (id, name, public) VALUES ('user_documents', 'user_documents', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Usuários podem gerenciar seus próprios documentos." ON storage.objects
FOR ALL USING (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'user_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fim do Script --
