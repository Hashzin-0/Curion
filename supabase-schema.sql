-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT
);

CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  theme_color TEXT
);

CREATE TABLE experiences (
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

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE area_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID REFERENCES areas(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER CHECK (level >= 1 AND level <= 100)
);

CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  course TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (For prototype, allowing public read/write. In production, restrict writes to authenticated users)
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

-- 4. Storage Rules (If you plan to upload images like company_logo or photo_url)
-- Create a bucket named 'portfolio-assets'
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-assets', 'portfolio-assets', true);

-- Allow public read access to the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-assets');

-- Allow authenticated users to upload files (or public for prototype)
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-assets');
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-assets');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-assets');

-- 5. Insert Initial Mock Data (Optional, to have something to see)
INSERT INTO users (id, username, name, photo_url, headline, summary, location) 
VALUES ('11111111-1111-1111-1111-111111111111', 'kardec', 'Allan Kardec', 'https://picsum.photos/seed/kardec/200/200', 'Profissional Multidisciplinar', 'Experiência em diversas áreas, buscando sempre aprender e entregar o melhor resultado.', 'São Paulo, SP');

INSERT INTO areas (id, name, slug, icon, theme_color) VALUES 
('22222222-2222-2222-2222-222222222221', 'Auxiliar de Cozinha', 'auxiliar-cozinha', 'ChefHat', 'orange'),
('22222222-2222-2222-2222-222222222222', 'Atendente', 'atendente', 'MessageSquare', 'blue'),
('22222222-2222-2222-2222-222222222223', 'Estoquista', 'estoquista', 'Package', 'green');
