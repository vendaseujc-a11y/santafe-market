-- Add role field to perfis table
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'admin'));

-- Update existing profiles to be admin if they were created before (manually set)
-- INSERT INTO perfis (id, nome, telefone, role) VALUES ... for specific admin users