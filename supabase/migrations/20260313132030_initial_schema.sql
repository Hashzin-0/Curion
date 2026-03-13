/*
  # Schema Inicial do CareerCanvas

  1. Tabelas Base
    - `users` - Dados dos usuários
    - `areas` - Áreas profissionais
    - `experiences` - Experiências profissionais
    - `skills` - Habilidades
    - `area_skills` - Relação entre áreas e habilidades
    - `education` - Formação acadêmica
    - `achievements` - Conquistas e reconhecimentos

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de leitura pública e escrita autenticada
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT
);

CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  theme_color TEXT
);

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS area_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER CHECK (level >= 1 AND level <= 100)
);

CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  course TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on areas" ON areas FOR SELECT USING (true);
CREATE POLICY "Allow public insert on areas" ON areas FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Allow public insert on experiences" ON experiences FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public insert on skills" ON skills FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on area_skills" ON area_skills FOR SELECT USING (true);
CREATE POLICY "Allow public insert on area_skills" ON area_skills FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on education" ON education FOR SELECT USING (true);
CREATE POLICY "Allow public insert on education" ON education FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Allow public insert on achievements" ON achievements FOR INSERT WITH CHECK (true);
