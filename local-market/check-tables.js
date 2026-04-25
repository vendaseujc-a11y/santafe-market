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

async function createTable(name, columns) {
  console.log(`Criando tabela ${name}...`);
  const res = await request('POST', '/rest/v1/rpc/create_table', {
    table_name: name,
    columns: columns
  });
  console.log(`  Status: ${res.status}, Body: ${res.body}`);
}

async function main() {
  console.log('Verificando tabelas...\n');

  const tables = ['perfis', 'produtos', 'verificacoes', 'avaliacoes'];

  for (const table of tables) {
    try {
      const res = await request('GET', `/rest/v1/${table}?limit=1`);
      console.log(`✓ ${table}: OK (${res.status})`);
    } catch (e) {
      console.log(`✗ ${table}: ERRO - ${e.message}`);
    }
  }

  console.log('\nTabelas verificadas!');
}

main().catch(console.error);
