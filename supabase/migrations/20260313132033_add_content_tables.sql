/*
  # Adicionar Tabelas de Conteúdo

  1. Novas Tabelas
    - `certificates` - Certificados e diplomas
    - `portfolio` - Itens de portfólio
    - `recommendations` - Cartas de recomendação

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de leitura pública e escrita autenticada
*/

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  institution text NOT NULL,
  date date NOT NULL,
  file_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificates are publicly readable"
  ON certificates FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates"
  ON certificates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own certificates"
  ON certificates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  file_url text,
  link_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio is publicly readable"
  ON portfolio FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own portfolio items"
  ON portfolio FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio items"
  ON portfolio FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio items"
  ON portfolio FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  author_name text NOT NULL,
  author_position text NOT NULL,
  author_company text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  file_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recommendations are publicly readable"
  ON recommendations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
