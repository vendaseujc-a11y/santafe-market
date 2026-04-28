-- Adiciona coluna whatsapp na tabela produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS whatsapp TEXT;