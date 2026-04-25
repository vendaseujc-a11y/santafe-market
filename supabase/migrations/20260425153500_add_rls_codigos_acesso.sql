-- Add RLS policies for codigos_acesso (if not exists)
ALTER TABLE codigos_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir admin gerenciar codigos" ON codigos_acesso;
DROP POLICY IF EXISTS "Permitir validacao publica de codigos" ON codigos_acesso;

CREATE POLICY "Permitir admin gerenciar codigos"
    ON codigos_acesso FOR ALL
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permitir validacao publica de codigos"
    ON codigos_acesso FOR SELECT
    USING (true);