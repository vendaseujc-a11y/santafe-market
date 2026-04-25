-- Tabela de perfis (vendedores)
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  whatsapp TEXT,
  imagem_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  vendedor_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  vendido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de verificações (selfies)
CREATE TABLE IF NOT EXISTS verificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  imagem_selfie TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos
CREATE POLICY "Produtos ativos públicos são visíveis" ON produtos
  FOR SELECT USING (ativo = true);

CREATE POLICY "Vendedores gerenciam seus produtos" ON produtos
  FOR ALL USING (auth.uid() = vendedor_id);

-- Políticas RLS para perfis
CREATE POLICY "Perfis são visíveis para o dono" ON perfis
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Qualquer um pode criar perfil" ON perfis
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para verificações
CREATE POLICY "Verificações públicas para escrita" ON verificacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Verificações visíveis para leitura pública" ON verificacoes
  FOR SELECT USING (true);

-- Políticas RLS para avaliações
CREATE POLICY "Avaliações públicas para leitura" ON avaliacoes
  FOR SELECT USING (true);

CREATE POLICY "Avaliações podem ser criadas" ON avaliacoes
  FOR INSERT WITH CHECK (true);

-- Storage Bucket para imagens
INSERT INTO storage.buckets (id, name, public) 
VALUES ('local-market', 'local-market', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Imagens públicas acessíveis" ON storage.objects
  FOR SELECT USING (bucket_id = 'local-market');

CREATE POLICY "Imagens podem ser enviadas" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'local-market');
