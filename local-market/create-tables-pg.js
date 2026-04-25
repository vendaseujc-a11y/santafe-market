const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:3XsrSJS7hgPgUhUf@db.vqmxfejgfzyidnldjikq.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('Criando tabelas...\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS perfis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        whatsapp TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ perfis');

    await client.query(`
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
      )
    `);
    console.log('✓ produtos');

    await client.query(`
      CREATE TABLE IF NOT EXISTS verificacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL,
        produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
        imagem_selfie TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        ip_address TEXT
      )
    `);
    console.log('✓ verificacoes');

    await client.query(`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
        avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
        comentario TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ avaliacoes');

    console.log('\n=== TODAS AS TABELAS CRIADAS! ===');
  } finally {
    client.release();
    await pool.end();
  }
}

createTables().catch(console.error);
