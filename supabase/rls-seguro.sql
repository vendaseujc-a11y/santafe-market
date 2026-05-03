-- ============================================
-- POLÍTICAS RLS SEGURAS - SantaFé Market
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_acesso ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: codigos_acesso
-- ============================================

DROP POLICY IF EXISTS "permit_anon_read_codigos" ON codigos_acesso;
DROP POLICY IF EXISTS "permit_service_role_all_codigos" ON codigos_acesso;

CREATE POLICY "permit_anon_read_codigos"
    ON codigos_acesso FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "permit_service_role_all_codigos"
    ON codigos_acesso FOR ALL
    TO service_role
    USING (true);

-- ============================================
-- POLÍTICAS: perfis
-- ============================================

DROP POLICY IF EXISTS "permit_all_authenticated_read_perfis" ON perfis;
DROP POLICY IF EXISTS "permit_owner_update_perfis" ON perfis;
DROP POLICY IF EXISTS "permit_trigger_insert_perfis" ON perfis;

CREATE POLICY "permit_all_authenticated_read_perfis"
    ON perfis FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "permit_owner_update_perfis"
    ON perfis FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "permit_trigger_insert_perfis"
    ON perfis FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS: produtos
-- ============================================

DROP POLICY IF EXISTS "permit_all_authenticated_read_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_anon_read_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_owner_insert_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_owner_update_produtos" ON produtos;
DROP POLICY IF EXISTS "permit_owner_delete_produtos" ON produtos;

CREATE POLICY "permit_all_authenticated_read_produtos"
    ON produtos FOR SELECT
    TO authenticated
    USING (status = 'ativo' OR auth.uid() = vendedor_id);

CREATE POLICY "permit_anon_read_produtos"
    ON produtos FOR SELECT
    TO anon
    USING (status = 'ativo');

CREATE POLICY "permit_owner_insert_produtos"
    ON produtos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "permit_owner_update_produtos"
    ON produtos FOR UPDATE
    TO authenticated
    USING (auth.uid() = vendedor_id);

CREATE POLICY "permit_owner_delete_produtos"
    ON produtos FOR DELETE
    TO authenticated
    USING (auth.uid() = vendedor_id);

-- ============================================
-- POLÍTICAS: verificacoes
-- ============================================

DROP POLICY IF EXISTS "permit_anon_insert_verificacoes" ON verificacoes;
DROP POLICY IF EXISTS "permit_service_role_read_verificacoes" ON verificacoes;

CREATE POLICY "permit_anon_insert_verificacoes"
    ON verificacoes FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "permit_service_role_read_verificacoes"
    ON verificacoes FOR SELECT
    TO service_role
    USING (true);

-- ============================================
-- POLÍTICAS: avaliacoes
-- ============================================

DROP POLICY IF EXISTS "permit_anon_read_avaliacoes" ON avaliacoes;
DROP POLICY IF EXISTS "permit_authenticated_insert_avaliacoes" ON avaliacoes;

CREATE POLICY "permit_anon_read_avaliacoes"
    ON avaliacoes FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "permit_authenticated_insert_avaliacoes"
    ON avaliacoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- POLÍTICAS: Storage
-- ============================================

DROP POLICY IF EXISTS "permit_authenticated_upload_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_owner_update_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_owner_delete_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_anon_read_storage" ON storage.objects;
DROP POLICY IF EXISTS "permit_anon_insert_verificacoes_storage" ON storage.objects;

CREATE POLICY "permit_authenticated_upload_storage"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('produtos', 'avatares', 'verificacoes') AND auth.uid()::text = owner::text);

CREATE POLICY "permit_owner_update_storage"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = owner::text);

CREATE POLICY "permit_owner_delete_storage"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.uid()::text = owner::text);

CREATE POLICY "permit_anon_read_storage"
    ON storage.objects FOR SELECT
    TO anon
    USING (bucket_id IN ('produtos', 'avatares', 'verificacoes'));

CREATE POLICY "permit_anon_insert_verificacoes_storage"
    ON storage.objects FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'verificacoes');