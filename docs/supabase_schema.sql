-- 1. LIMPEZA (OPCIONAL - CASO QUEIRA EXECUTAR NOVAMENTE)
-- DROP TABLE IF EXISTS recommendations, portfolio, certificates, achievements, education, area_skills, skills, experiences, areas, users CASCADE;

-- 2. TABELA DE USUÁRIOS (Sincronizada com Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÁREAS PROFISSIONAIS
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'Briefcase',
  theme_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXPERIÊNCIAS PROFISSIONAIS
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABILIDADES (Tabela Global de Referência)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Star'
);

-- 6. HABILIDADES POR ÁREA (Vínculo Usuário-Área-Habilidade)
CREATE TABLE area_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 50 CHECK (level >= 0 AND level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FORMAÇÃO ACADÊMICA
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  course TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONQUISTAS / PRÊMIOS
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CERTIFICADOS
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  date DATE NOT NULL,
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PORTFÓLIO
CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  link_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CARTAS DE RECOMENDAÇÃO
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_position TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_skills ENABLE ROW LEVEL SECURITY;

-- REGRAS PARA 'USERS'
CREATE POLICY "Perfis são públicos para leitura" ON users FOR SELECT USING (true);
CREATE POLICY "Usuários podem editar próprio perfil" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir próprio perfil" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- REGRAS PARA TABELAS DEPENDENTES DE USUÁRIO (Areas, Exp, Edu, etc)
-- Aplicar para: areas, experiences, education, achievements, certificates, portfolio, recommendations
DO $$ 
DECLARE 
  t text;
BEGIN 
  FOR t IN SELECT table_name FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name IN ('areas', 'experiences', 'education', 'achievements', 'certificates', 'portfolio', 'recommendations')
  LOOP
    EXECUTE format('CREATE POLICY "Leitura pública para %s" ON %s FOR SELECT USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Apenas dono pode inserir em %s" ON %s FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "Apenas dono pode editar em %s" ON %s FOR UPDATE USING (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "Apenas dono pode deletar em %s" ON %s FOR DELETE USING (auth.uid() = user_id)', t, t);
  END LOOP;
END $$;

-- REGRAS PARA 'SKILLS' (Leitura global, escrita restrita)
CREATE POLICY "Skills são públicas para leitura" ON skills FOR SELECT USING (true);
CREATE POLICY "Usuários logados podem sugerir skills" ON skills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- REGRAS PARA 'AREA_SKILLS' (Dono da área controla suas skills)
CREATE POLICY "Area_skills são públicas para leitura" ON area_skills FOR SELECT USING (true);
CREATE POLICY "Apenas dono da área pode gerenciar skills" ON area_skills 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM areas 
      WHERE areas.id = area_skills.area_id 
      AND areas.user_id = auth.uid()
    )
  );

-- POPULAR SKILLS INICIAIS (Opcional)
INSERT INTO skills (name, icon) VALUES 
('React', 'Code2'), ('Node.js', 'Server'), ('Design Gráfico', 'Palette'), 
('Gestão de Pessoas', 'Users'), ('Inglês Fluente', 'Languages'), 
('Cozinha Italiana', 'ChefHat'), ('Marketing Digital', 'TrendingUp')
ON CONFLICT DO NOTHING;
