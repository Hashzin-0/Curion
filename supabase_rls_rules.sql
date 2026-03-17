
-- HABILITAR RLS NAS TABELAS
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

-- REGRAS PARA TABELA 'users'
CREATE POLICY "Profiles are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can only update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- REGRAS PARA TABELA 'areas'
CREATE POLICY "Areas are viewable by everyone" ON areas FOR SELECT USING (true);
CREATE POLICY "Users can manage their own areas" ON areas FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'experiences'
CREATE POLICY "Experiences are viewable by everyone" ON experiences FOR SELECT USING (true);
CREATE POLICY "Users can manage their own experiences" ON experiences FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'education'
CREATE POLICY "Education is viewable by everyone" ON education FOR SELECT USING (true);
CREATE POLICY "Users can manage their own education" ON education FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'achievements'
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage their own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'certificates'
CREATE POLICY "Certificates are viewable by everyone" ON certificates FOR SELECT USING (true);
CREATE POLICY "Users can manage their own certificates" ON certificates FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'portfolio'
CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio FOR SELECT USING (true);
CREATE POLICY "Users can manage their own portfolio items" ON portfolio FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'recommendations'
CREATE POLICY "Recommendations are viewable by everyone" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Users can manage their own recommendations" ON recommendations FOR ALL USING (auth.uid() = user_id);

-- REGRAS PARA TABELA 'skills' (Catálogo compartilhado)
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);

-- REGRAS PARA TABELA 'area_skills' (Mapeamento)
CREATE POLICY "Area skills are viewable by everyone" ON area_skills FOR SELECT USING (true);
-- Nota: A escrita em area_skills deve ser protegida com base na posse da 'area_id'
-- Para simplificar neste MVP, permitimos a leitura global.
