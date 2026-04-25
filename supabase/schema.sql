-- SantaFé Marketplace - Schema SQL
-- Execute este arquivo no Supabase SQL Editor

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: perfis (vendedores)
-- ============================================
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perfis_updated_at
    BEFORE UPDATE ON perfis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: produtos
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    categoria TEXT NOT NULL,
    imagens TEXT[] NOT NULL DEFAULT '{}',
    localizacao TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vendido', 'inativo')),
    visualizacoes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_produtos_updated_at
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índice para busca por slug
CREATE INDEX idx_produtos_slug ON produtos(slug);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_vendedor ON produtos(vendedor_id);
CREATE INDEX idx_produtos_created_at ON produtos(created_at DESC);

-- ============================================
-- TABELA: verificacoes
-- ============================================
CREATE TABLE IF NOT EXISTS verificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sessao_id TEXT NOT NULL,
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    selfie_url TEXT NOT NULL,
    hash_validacao TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verificacoes_hash ON verificacoes(hash_validacao);
CREATE INDEX idx_verificacoes_sessao ON verificacoes(sessao_id);
CREATE INDEX idx_verificacoes_created_at ON verificacoes(created_at DESC);

-- ============================================
-- TABELA: avaliacoes
-- ============================================
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
    nota INTEGER CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_avaliacoes_vendedor ON avaliacoes(vendedor_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Limpar políticas existentes
DROP POLICY IF EXISTS "Permitir visualização pública de perfis" ON perfis;
DROP POLICY IF EXISTS "Permitir atualização de próprio perfil" ON perfis;
DROP POLICY IF EXISTS "Permitir insertion de perfil via trigger" ON perfis;

DROP POLICY IF EXISTS "Permitir visualização pública de produtos ativos" ON produtos;
DROP POLICY IF EXISTS "Permitir inserção de produtos pelo dono" ON produtos;
DROP POLICY IF EXISTS "Permitir atualização de próprio produto" ON produtos;
DROP POLICY IF EXISTS "Permitir exclusão de próprio produto" ON produtos;

DROP POLICY IF EXISTS "Permitir inserção de verificações públicas" ON verificacoes;
DROP POLICY IF EXISTS "Permitir visualização de verificações autenticadas" ON verificacoes;

DROP POLICY IF EXISTS "Permitir visualização pública de avaliações" ON avaliacoes;
DROP POLICY IF EXISTS "Permitir inserção de avaliações" ON avaliacoes;

-- ============================================
-- POLÍTICAS: perfis
-- ============================================

-- Qualquer pessoa logada pode ver perfis (para ver vendedor do anúncio)
CREATE POLICY "Permitir visualização pública de perfis"
    ON perfis FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Dono pode atualizar seu próprio perfil
CREATE POLICY "Permitir atualização de próprio perfil"
    ON perfis FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- POLÍTICAS: produtos
-- ============================================

-- Qualquer pessoa pode ver produtos ativos (público)
CREATE POLICY "Permitir visualização pública de produtos ativos"
    ON produtos FOR SELECT
    USING (status = 'ativo' OR auth.uid() = vendedor_id);

-- Apenas vendedor logado pode inserir produtos
CREATE POLICY "Permitir inserção de produtos pelo dono"
    ON produtos FOR INSERT
    WITH CHECK (auth.uid() = vendedor_id);

-- Apenas vendedor logado pode atualizar seu próprio produto
CREATE POLICY "Permitir atualização de próprio produto"
    ON produtos FOR UPDATE
    USING (auth.uid() = vendedor_id);

-- Apenas vendedor logado pode excluir seu próprio produto
CREATE POLICY "Permitir exclusão de próprio produto"
    ON produtos FOR DELETE
    USING (auth.uid() = vendedor_id);

-- ============================================
-- POLÍTICAS: verificacoes
-- ============================================

-- Qualquer pessoa pode inserir verificação (validação de selfie pública)
CREATE POLICY "Permitir inserção de verificações públicas"
    ON verificacoes FOR INSERT
    WITH CHECK (true);

-- Apenas pessoas autenticadas podem ver verificações
CREATE POLICY "Permitir visualização de verificações autenticadas"
    ON verificacoes FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ============================================
-- POLÍTICAS: avaliacoes
-- ============================================

-- Qualquer pessoa pode ver avaliações
CREATE POLICY "Permitir visualização pública de avaliações"
    ON avaliacoes FOR SELECT
    USING (true);

-- Qualquer pessoa pode inserir avaliação
CREATE POLICY "Permitir inserção de avaliações"
    ON avaliacoes FOR INSERT
    WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('verificacoes', 'verificacoes', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para Storage
DROP POLICY IF EXISTS "Permitir upload de imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública de imagens" ON storage.objects;

CREATE POLICY "Permitir upload de imagens de produtos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('produtos', 'avatares', 'verificacoes'));

CREATE POLICY "Permitir visualização pública de imagens"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('produtos', 'avatares', 'verificacoes'));

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Normalizar título para slug
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := trim(regexp_replace(base_slug, '\s+', '-', 'g'));
    slug := base_slug;
    
    -- Verificar se slug já existe e adicionar sufixo
    WHILE EXISTS (SELECT 1 FROM produtos WHERE slug = slug) LOOP
        counter := counter + 1;
        slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente após cadastro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, nome, telefone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', ''),
        COALESCE(NEW.raw_user_meta_data->>'telefone', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TABELA: codigos_acesso
-- ============================================
CREATE TABLE IF NOT EXISTS codigos_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    utilizadas INTEGER DEFAULT 0,
    limite_utilizacoes INTEGER DEFAULT 1,
    utilizado BOOLEAN DEFAULT false,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_codigos_acesso_codigo ON codigos_acesso(codigo);

-- RLS para codigos_acesso
ALTER TABLE codigos_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir admin gerenciar codigos" ON codigos_acesso;
DROP POLICY IF EXISTS "Permitir validacao publica de codigos" ON codigos_acesso;

CREATE POLICY "Permitir admin gerenciar codigos"
    ON codigos_acesso FOR ALL
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir validacao publica de codigos"
    ON codigos_acesso FOR SELECT
    USING (true);

-- Inserir códigos de exemplo
INSERT INTO codigos_acesso (codigo, limite_utilizacoes) VALUES 
    ('SANTAFE24', 1),
    ('MERCADO24', 1),
    ('VENDEDOR', 1);