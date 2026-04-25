-- Add delete permissions for own data
DROP POLICY IF EXISTS "Permitir exclusao de proprio perfil" ON perfis;
DROP POLICY IF EXISTS "Permitir exclusao de proprios produtos" ON produtos;

CREATE POLICY "Permitir exclusao de proprio perfil"
    ON perfis FOR DELETE
    USING (auth.uid() = id);

CREATE POLICY "Permitir exclusao de proprios produtos"
    ON produtos FOR DELETE
    USING (auth.uid() = vendedor_id);