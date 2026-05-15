-- ============================================
-- SANTAFÉ MARKETPLACE - SEGURANÇA MÁXIMA
-- Execute este arquivo no Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CONFIGURAÇÕES DE AUTENTICAÇÃO
-- ============================================

-- Configurar taxa de limite de tentativas de login
ALTER AUTH CONFIG SET sign_up_confirm_email_enabled = true;
ALTER AUTH CONFIG SET enable_confirmations = true;

-- Configurar expiração de sessão (24 horas)
ALTER AUTH CONFIG SET session_time_to_live = 86400;

-- ============================================
-- 2. TABELA DE LOG DE AUDITORIA
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para auditoria
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Habilitar RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permit_service_role_insert_audit" ON audit_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "permit_service_role_read_audit" ON audit_log FOR SELECT TO service_role USING (true);

-- ============================================
-- 3. TABELA DE BLOQUEIO DE IP
-- ============================================

CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    blocked_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_ip_blocklist_address ON ip_blocklist(ip_address);
CREATE INDEX idx_ip_blocklist_expires ON ip_blocklist(expires_at);

ALTER TABLE ip_blocklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permit_service_role_all_blocklist" ON ip_blocklist FOR ALL TO service_role USING (true);

-- ============================================
-- 4. TABELA DE RATE LIMIT
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP ou user_id
    action TEXT NOT NULL,     -- login, upload, verificar, etc
    count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, action);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permit_service_role_all_rate_limits" ON rate_limits FOR ALL TO service_role USING (true);

-- ============================================
-- 5. FUNÇÕES DE SEGURANÇA
-- ============================================

-- Função para registrar ação de auditoria
CREATE OR REPLACE FUNCTION log_audit(
    p_user_id UUID,
    p_action TEXT,
    p_table_name TEXT DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, metadata, ip_address, user_agent)
    VALUES (
        p_user_id,
        p_action,
        p_table_name,
        p_record_id,
        p_metadata,
        COALESCE(current_setting('request.ip_address', true), 'unknown'),
        COALESCE(current_setting('request.user_agent', true), 'unknown')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar IP bloqueado
CREATE OR REPLACE FUNCTION is_ip_blocked(p_ip TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    blocked BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM ip_blocklist 
        WHERE ip_address = p_ip 
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO blocked;
    
    RETURN COALESCE(blocked, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para bloquear IP
CREATE OR REPLACE FUNCTION block_ip(
    p_ip TEXT,
    p_reason TEXT DEFAULT 'Rate limit exceeded',
    p_duration INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ip_blocklist (ip_address, reason, expires_at)
    VALUES (p_ip, p_reason, NOW() + p_duration)
    ON CONFLICT (ip_address) DO UPDATE
    SET reason = EXCLUDED.reason,
        expires_at = EXCLUDED.expires_at,
        blocked_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_limit INTEGER,
    p_window INTERVAL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    -- Obter janela atual
    SELECT window_start INTO window_start
    FROM rate_limits
    WHERE identifier = p_identifier AND action = p_action
    ORDER BY window_start DESC
    LIMIT 1;
    
    -- Se não existe ou janela expirou, criar novo registro
    IF window_start IS NULL OR window_start < NOW() - p_window THEN
        INSERT INTO rate_limits (identifier, action, count, window_start)
        VALUES (p_identifier, p_action, 1, NOW())
        ON CONFLICT (identifier, action) DO UPDATE
        SET count = 1, window_start = NOW();
        
        RETURN true;
    END IF;
    
    -- Verificar limite
    SELECT count INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier AND action = p_action AND window_start = window_start;
    
    IF current_count >= p_limit THEN
        RETURN false;
    END IF;
    
    -- Incrementar contador
    UPDATE rate_limits
    SET count = count + 1
    WHERE identifier = p_identifier AND action = p_action AND window_start = window_start;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. POLÍTICAS RLS APERFEIÇOADAS
-- ============================================

-- Limpar políticas existentes
DROP POLICY IF EXISTS "permit_anon_read_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_all_authenticated_read_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_owner_insert_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_owner_update_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_owner_delete_produtos" ON produtos;

-- PRODUTOS: Leitura pública APENAS de produtos ativos (SEGURANÇA MÁXIMA)
CREATE POLICY "secure_anon_read_produtos"
    ON produtos FOR SELECT
    TO anon
    USING (
        status = 'ativo' 
        AND created_at > NOW() - INTERVAL '90 days'
        AND titulo IS NOT NULL
        AND titulo != ''
        AND descricao IS NOT NULL
        AND descricao != ''
    );

-- PRODUTOS: Usuários autenticados veem ativos + próprios
CREATE POLICY "secure_auth_read_produtos"
    ON produtos FOR SELECT
    TO authenticated
    USING (
        status = 'ativo' 
        OR auth.uid() = vendedor_id
    );

-- PRODUTOS: Inserção com validação rigorosa
CREATE POLICY "secure_insert_produtos"
    ON produtos FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = vendedor_id
        AND LENGTH(titulo) >= 3
        AND LENGTH(titulo) <= 100
        AND LENGTH(descricao) >= 10
        AND LENGTH(descricao) <= 5000
        AND preco > 0
        AND preco < 1000000
        AND categoria IN ('promocao', 'produtos', 'eletronicos', 'servicos', 'veiculos', 'vestuario', 'outros')
        AND array_length(imagens, 1) <= 5
    );

-- PRODUTOS: Atualização apenas pelo dono
CREATE POLICY "secure_update_produtos"
    ON produtos FOR UPDATE
    TO authenticated
    USING (auth.uid() = vendedor_id)
    WITH CHECK (
        auth.uid() = vendedor_id
        AND LENGTH(titulo) >= 3
        AND LENGTH(titulo) <= 100
        AND LENGTH(descricao) >= 10
        AND LENGTH(descricao) <= 5000
        AND preco > 0
        AND preco < 1000000
    );

-- PRODUTOS: Exclusão apenas pelo dono
CREATE POLICY "secure_delete_produtos"
    ON produtos FOR DELETE
    TO authenticated
    USING (auth.uid() = vendedor_id);

-- ============================================
-- 7. POLÍTICAS PERFILIS APERFEIÇOADAS
-- ============================================

DROP POLICY IF EXISTS "permit_all_authenticated_read_perfis" ON perfis;
DROP POLICY IF EXISTS "permit_owner_update_perfis" ON perfis;
DROP POLICY IF EXISTS "permit_trigger_insert_perfis" ON perfis;

-- PERFIS: Apenas usuários autenticados podem ver
CREATE POLICY "secure_read_perfis"
    ON perfis FOR SELECT
    TO authenticated
    USING (
        id = auth.uid()
        OR EXISTS (SELECT 1 FROM produtos WHERE vendedor_id = auth.uid() AND status = 'ativo')
    );

-- PERFIS: Dono pode atualizar
CREATE POLICY "secure_update_perfis"
    ON perfis FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND LENGTH(COALESCE(nome, '')) >= 2
        AND LENGTH(COALESCE(nome, '')) <= 100
        AND LENGTH(COALESCE(telefone, '')) >= 10
        AND LENGTH(COALESCE(telefone, '')) <= 20
    );

-- PERFIS: Inserção apenas via trigger (usando SECURITY DEFINER)
CREATE POLICY "secure_insert_perfis"
    ON perfis FOR INSERT
    TO anon
    WITH CHECK (false); -- Desabilita insert público, apenas trigger

-- ============================================
-- 8. POLÍTICAS VERIFICAÇÕES APERFEIÇOADAS
-- ============================================

DROP POLICY IF EXISTS "permit_anon_insert_verificacoes" ON verificacoes;
DROP POLICY IF EXISTS "permit_service_role_read_verificacoes" ON verificacoes;

-- VERIFICAÇÕES: Inserção com rate limiting (via API)
CREATE POLICY "secure_insert_verificacoes"
    ON verificacoes FOR INSERT
    TO anon
    WITH CHECK (
        LENGTH(sessao_id) >= 10
        AND LENGTH(sessao_id) <= 100
        AND LENGTH(selfie_url) > 0
    );

-- VERIFICAÇÕES: Apenas service role pode ler (auditoria)
CREATE POLICY "secure_read_verificacoes"
    ON verificacoes FOR SELECT
    TO service_role
    USING (true);

-- ============================================
-- 9. POLÍTICAS CÓDIGOS ACESSO APERFEIÇOADAS
-- ============================================

DROP POLICY IF EXISTS "permit_anon_read_codigos" ON codigos_acesso;
DROP POLICY IF EXISTS "permit_service_role_all_codigos" ON codigos_acesso;

-- CÓDIGOS: Leitura sem expor informações sensíveis
CREATE POLICY "secure_read_codigos"
    ON codigos_acesso FOR SELECT
    TO anon
    USING (
        utilizado = false
        AND (limite_utilizacoes > utilizadas)
        AND (expires_at IS NULL OR expires_at > NOW())
    );

-- CÓDIGOS: Atualização apenas service role
CREATE POLICY "secure_update_codigos"
    ON codigos_acesso FOR UPDATE
    TO service_role
    USING (true);

-- ============================================
-- 10. STORAGE POLICIES APERFEIÇOADAS
-- ============================================

DROP POLICY IF EXISTS "permit_authenticated_upload_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_owner_update_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_owner_delete_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_anon_read_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_anon_insert_verificacoes_storage" ON storage.objects;

-- Storage: Upload com validação rigorosa
CREATE POLICY "secure_upload_storage"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('produtos', 'avatares')
        AND auth.uid()::text = owner::text
        AND (
            (name LIKE '%.jpg' OR name LIKE '%.jpeg' OR name LIKE '%.png' OR name LIKE '%.webp')
            AND size < 10485760 -- 10MB
        )
    );

-- Storage: Update apenas dono
CREATE POLICY "secure_update_storage"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = owner::text)
    WITH CHECK (
        auth.uid()::text = owner::text
        AND (
            (name LIKE '%.jpg' OR name LIKE '%.jpeg' OR name LIKE '%.png' OR name LIKE '%.webp')
            AND size < 10485760
        )
    );

-- Storage: Delete apenas dono
CREATE POLICY "secure_delete_storage"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.uid()::text = owner::text);

-- Storage: Leitura pública apenas de imagens válidas
CREATE POLICY "secure_read_storage"
    ON storage.objects FOR SELECT
    TO anon
    USING (
        bucket_id IN ('produtos', 'avatares', 'verificacoes')
        AND (
            name LIKE '%.jpg' OR name LIKE '%.jpeg' OR name LIKE '%.png' OR name LIKE '%.webp'
        )
        AND size < 10485760
    );

-- Storage: Verificações (anon insert com limite)
CREATE POLICY "secure_insert_verificacoes_storage"
    ON storage.objects FOR INSERT
    TO anon
    WITH CHECK (
        bucket_id = 'verificacoes'
        AND (
            name LIKE '%.jpg' OR name LIKE '%.jpeg' OR name LIKE '%.png'
        )
        AND size < 5242880 -- 5MB para selfies
    );

-- ============================================
-- 11. TRIGGER DE AUDITORIA
-- ============================================

CREATE OR REPLACE FUNCTION trigger_audit_produtos()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_audit(NEW.vendedor_id, 'INSERT', 'produtos', NEW.id, 
            jsonb_build_object('titulo', NEW.titulo, 'preco', NEW.preco));
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_audit(NEW.vendedor_id, 'UPDATE', 'produtos', NEW.id,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_audit(OLD.vendedor_id, 'DELETE', 'produtos', OLD.id,
            jsonb_build_object('titulo', OLD.titulo));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_produtos_trigger ON produtos;
CREATE TRIGGER audit_produtos_trigger
    AFTER INSERT OR UPDATE OR DELETE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_audit_produtos();

-- ============================================
-- 12. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_produtos_search ON produtos USING GIN(to_tsvector('portuguese', titulo || ' ' || descricao));
CREATE INDEX IF NOT EXISTS idx_audit_log_user_action ON audit_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- ============================================
-- 13. LIMPEZA AUTOMÁTICA
-- ============================================

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Limpar rate limits antigos (7 dias)
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '7 days';
    
    -- Limpar IPs bloqueados expirados
    DELETE FROM ip_blocklist WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- Limpar verificações antigas (30 dias)
    DELETE FROM verificacoes WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Limpar logs de auditoria antigos (90 dias)
    DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza automática (requer pg_cron ou execução manual)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT cleanup_old_data()');

-- ============================================
-- FIM DAS CONFIGURAÇÕES DE SEGURANÇA
-- ============================================