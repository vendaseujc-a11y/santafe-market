const fetch = require('fetch');
const SUPABASE_URL = 'https://vqmxfejgfzyidnldjikq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbXhmZWpnZnp5aWRubGRqaWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3ODg5NCwiZXhwIjoyMDkyMzU0ODk0fQ.NQvzuFl3w7u15EZU1p-IOoOOJeDEZBAuwUUF6W7Uh8E';

const schemas = `
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
`;

async function createTables() {
  console.log('Criando tabelas...');

  const tables = [
    { name: 'perfis', sql: `CREATE TABLE perfis (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, senha TEXT NOT NULL, whatsapp TEXT, created_at TIMESTAMPTZ DEFAULT NOW())` },
    { name: 'produtos', sql: `CREATE TABLE produtos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), titulo TEXT NOT NULL, descricao TEXT, preco DECIMAL(10,2) NOT NULL, whatsapp TEXT, imagem_url TEXT, slug TEXT UNIQUE NOT NULL, vendedor_id UUID REFERENCES perfis(id) ON DELETE CASCADE, ativo BOOLEAN DEFAULT true, vendido BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())` },
    { name: 'verificacoes', sql: `CREATE TABLE verificacoes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id TEXT NOT NULL, produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE, imagem_selfie TEXT, timestamp TIMESTAMPTZ DEFAULT NOW(), ip_address TEXT)` },
    { name: 'avaliacoes', sql: `CREATE TABLE avaliacoes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE, avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5), comentario TEXT, created_at TIMESTAMPTZ DEFAULT NOW())` }
  ];

  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({ query: table.sql })
      });
      console.log(`Tabela ${table.name}: ${res.ok ? 'OK' : 'ERRO'}`);
    } catch (e) {
      console.log(`Tabela ${table.name}: ERRO - ${e.message}`);
    }
  }

  console.log('\nCriando bucket de storage...');
  const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({ id: 'local-market', name: 'local-market', public: true })
  });
  console.log(`Bucket: ${bucketRes.ok ? 'OK' : 'ERRO'}`);

  console.log('\nSetup concluído!');
}

createTables();
