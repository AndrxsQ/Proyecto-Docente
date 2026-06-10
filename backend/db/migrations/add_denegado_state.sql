-- Migration to add DENEGADO state to proyectos_docente table
-- and DENEGACION type to observaciones table

-- Drop existing CHECK constraint on proyectos_docente.estado
ALTER TABLE proyectos_docente DROP CONSTRAINT IF EXISTS proyectos_docente_estado_check;

-- Add new CHECK constraint with DENEGADO included
ALTER TABLE proyectos_docente ADD CONSTRAINT proyectos_docente_estado_check 
CHECK (estado IN ('ELABORADO', 'EN_REVISION', 'REVISADO', 'AVALADO', 'APROBADO', 'DENEGADO'));

-- Drop existing CHECK constraint on observaciones.tipo
ALTER TABLE observaciones DROP CONSTRAINT IF EXISTS observaciones_tipo_check;

-- Add new CHECK constraint with DENEGACION included
ALTER TABLE observaciones ADD CONSTRAINT observaciones_tipo_check 
CHECK (tipo IN ('DEVOLUCION', 'COMENTARIO', 'APROBACION', 'DENEGACION'));
