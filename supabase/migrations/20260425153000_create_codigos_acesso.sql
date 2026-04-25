-- Create codigos_acesso table
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

-- RLS for codigos_acesso
ALTER TABLE codigos_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir admin gerenciar codigos" ON codigos_acesso;
DROP POLICY IF EXISTS "Permitir validacao publica de codigos" ON codigos_acesso;

CREATE POLICY "Permitir admin gerenciar codigos"
    ON codigos_acesso FOR ALL
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir validacao publica de codigos"
    ON codigos_acesso FOR SELECT
    USING (true);

-- Insert sample codes
INSERT INTO codigos_acesso (codigo, limite_utilizacoes) VALUES 
    ('SANTAFE24', 1),
    ('MERCADO24', 1),
    ('VENDEDOR', 1);