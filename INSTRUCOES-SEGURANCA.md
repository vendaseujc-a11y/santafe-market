# Instruções de Segurança - SantaFé Marketplace

## Execute no Supabase SQL Editor

### 1. Execute o arquivo de segurança máxima

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá para **SQL Editor**
3. Execute o arquivo: `supabase/seguranca-maxima.sql`

### 2. Verifique se RLS está habilitado

Execute este comando para verificar:
```sql
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Todas as tabelas devem mostrar `rowsecurity = true`

### 3. Verifique as políticas RLS

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 4. Atualize as variáveis de ambiente

Adicione em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_SITE_URL=https://seudominio.com
```

## Recursos de Segurança Implementados

### Backend (Supabase)
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Políticas rigorosas por角色 (anon, authenticated, service_role)
- ✅ Validação de entrada no banco de dados
- ✅ Limite de tamanho para campos de texto
- ✅ Verificação de categoria permitida
- ✅ Upload apenas de imagens (jpg, png, webp)
- ✅ Limite de 5 imagens por produto
- ✅ Preço máximo de 1 milhão
- ✅ Tabela de auditoria para logs
- ✅ Limpeza automática de dados antigos

### Frontend (Next.js)
- ✅ Headers de segurança (X-Frame-Options, X-XSS-Protection, etc)
- ✅ Rate limiting no middleware
- ✅ Rate limiting por IP em APIs
- ✅ Validação de tipo de conteúdo
- ✅ Sanitização de entrada
- ✅ Proteção contra XSS
- ✅ Prevenção de hotlinking

### APIs Protegidas
- `/api/validar-codigo` - Rate limit: 10 req/min
- `/api/upload` - Rate limit: 20 req/min, Max 10MB
- `/api/verificar` - Rate limit: 5 req/min, Max 5MB
- `/api/excluir-conta` - Apenas usuários autenticados

## Teste de Segurança

### Execute o build
```bash
npm run build
```

### Teste manual
1. Crie uma conta de vendedor
2. Faça login
3. Crie um produto
4. Visualize na homepage
5. Teste a validação de selfie

## Monitoramento

Consulte a tabela de auditoria:
```sql
SELECT * FROM audit_log 
ORDER BY created_at DESC 
LIMIT 100;
```

Consulte rate limits:
```sql
SELECT * FROM rate_limits 
ORDER BY window_start DESC 
LIMIT 50;
```