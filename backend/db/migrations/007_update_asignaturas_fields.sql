-- Update asignaturas table with new fields

-- Add new fields
ALTER TABLE asignaturas ADD COLUMN IF NOT EXISTS codigo VARCHAR(50);
ALTER TABLE asignaturas ADD COLUMN IF NOT EXISTS area VARCHAR(100);
ALTER TABLE asignaturas ADD COLUMN IF NOT EXISTS horas_ti INTEGER DEFAULT 0;
ALTER TABLE asignaturas ADD COLUMN IF NOT EXISTS horas_tde INTEGER DEFAULT 0;
ALTER TABLE asignaturas ADD COLUMN IF NOT EXISTS horas_tdp INTEGER DEFAULT 0;

-- Update existing tipo values to match new constraint
-- Map old values to new default 'obligatorio' (you can adjust this mapping as needed)
UPDATE asignaturas SET tipo = 'obligatorio' WHERE tipo NOT IN ('obligatorio', 'opcional');

-- Drop the old constraint and add the new one
ALTER TABLE asignaturas DROP CONSTRAINT IF EXISTS asignaturas_tipo_check;
ALTER TABLE asignaturas ADD CONSTRAINT asignaturas_tipo_check 
    CHECK (tipo IN ('obligatorio', 'opcional'));

-- Note: total_horas should be calculated as the sum of horas_ti + horas_tde + horas_tdp
-- This can be done via application logic or a database trigger
