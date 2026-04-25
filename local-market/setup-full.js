const https = require('https');

const SUPABASE_URL = 'https://vqmxfejgfzyidnldjikq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbXhmZWpnZnp5aWRubGRqaWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3ODg5NCwiZXhwIjoyMDkyMzU0ODk0fQ.NQvzuFl3w7u15EZU1p-IOoOOJeDEZBAuwUUF6W7Uh8E';

function postRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function setup() {
  console.log('=== CRIANDO TABELAS NO SUPABASE ===\n');

  console.log('1. Criando função exec_sql...');
  const createFuncSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE query;
    END;
    $$;
  `;
  
  try {
    await postRequest('/rest/v1/rpc/exec_sql', { query: createFuncSQL });
    console.log('   ✓ Função criada!\n');
  } catch (e) {
    console.log('   Função pode já existir ou erro:', e.message, '\n');
  }

  const tables = [
    { name: 'perfis', sql: 'CREATE TABLE IF NOT EXISTS perfis (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, senha TEXT NOT NULL, whatsapp TEXT, created_at TIMESTAMPTZ DEFAULT NOW())' },
    { name: 'produtos', sql: 'CREATE TABLE IF NOT EXISTS produtos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), titulo TEXT NOT NULL, descricao TEXT, preco DECIMAL(10,2) NOT NULL, whatsapp TEXT, imagem_url TEXT, slug TEXT UNIQUE NOT NULL, vendedor_id UUID REFERENCES perfis(id) ON DELETE CASCADE, ativo BOOLEAN DEFAULT true, vendido BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW())' },
    { name: 'verificacoes', sql: 'CREATE TABLE IF NOT EXISTS verificacoes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id TEXT NOT NULL, produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE, imagem_selfie TEXT, timestamp TIMESTAMPTZ DEFAULT NOW(), ip_address TEXT)' },
    { name: 'avaliacoes', sql: 'CREATE TABLE IF NOT EXISTS avaliacoes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE, avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5), comentario TEXT, created_at TIMESTAMPTZ DEFAULT NOW())' }
  ];

  for (const table of tables) {
    console.log(`2. Criando tabela ${table.name}...`);
    try {
      const res = await postRequest('/rest/v1/rpc/exec_sql', { query: table.sql });
      console.log(`   ✓ ${table.name}: ${res.status === 200 ? 'OK' : res.body}`);
    } catch (e) {
      console.log(`   ✗ ERRO: ${e.message}`);
    }
  }

  console.log('\n3. Criando bucket de storage...');
  try {
    await postRequest('/storage/v1/bucket', { id: 'local-market', name: 'local-market', public: true });
    console.log('   ✓ Bucket criado!');
  } catch (e) {
    console.log('   Bucket pode já existir');
  }

  console.log('\n=== SETUP CONCLUÍDO! ===');
}

setup().catch(console.error);
