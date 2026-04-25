const https = require('https');

const SUPABASE_URL = 'https://vqmxfejgfzyidnldjikq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbXhmZWpnZnp5aWRubGRqaWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3ODg5NCwiZXhwIjoyMDkyMzU0ODk0fQ.NQvzuFl3w7u15EZU1p-IOoOOJeDEZBAuwUUF6W7Uh8E';

function request(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': method === 'POST' ? 'return=minimal' : 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createTable(tableName, schema) {
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${schema});`;
  console.log(`Criando ${tableName}: ${sql}`);
  
  const res = await request('POST', '/rest/v1/rpc/exec_sql', { query: sql });
  console.log(`  Result: ${res.status} - ${res.body}\n`);
  return res;
}

async function main() {
  console.log('=== CRIANDO TABELAS NO SUPABASE ===\n');

  try {
    await createTable('perfis', `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      whatsapp TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    `);

    await createTable('produtos', `
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
    `);

    await createTable('verificacoes', `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
      imagem_selfie TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      ip_address TEXT
    `);

    await createTable('avaliacoes', `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
      avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
      comentario TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    `);

    console.log('=== TABELAS CRIADAS! ===');
  } catch (e) {
    console.log('ERRO:', e.message);
  }
}

main();
