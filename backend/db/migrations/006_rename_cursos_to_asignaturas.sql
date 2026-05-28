-- Rename 'cursos' table to 'asignaturas' and update all references

-- Rename the table
ALTER TABLE cursos RENAME TO asignaturas;

-- Update foreign key constraints
ALTER TABLE proyectos_docente DROP CONSTRAINT proyectos_docente_curso_id_fkey;
ALTER TABLE proyectos_docente ADD CONSTRAINT proyectos_docente_asignatura_id_fkey 
    FOREIGN KEY (curso_id) REFERENCES asignaturas(id) ON DELETE CASCADE;

ALTER TABLE seguimiento DROP CONSTRAINT seguimiento_curso_id_fkey;
ALTER TABLE seguimiento ADD CONSTRAINT seguimiento_asignatura_id_fkey 
    FOREIGN KEY (curso_id) REFERENCES asignaturas(id) ON DELETE CASCADE;

-- Rename columns
ALTER TABLE proyectos_docente RENAME COLUMN curso_id TO asignatura_id;
ALTER TABLE seguimiento RENAME COLUMN curso_id TO asignatura_id;

-- Update check constraint name
ALTER TABLE asignaturas DROP CONSTRAINT cursos_tipo_check;
ALTER TABLE asignaturas ADD CONSTRAINT asignaturas_tipo_check 
    CHECK (tipo IN ('teórico', 'práctico', 'teórico-práctico'));

-- Update index names
DROP INDEX IF EXISTS idx_cursos_programa;
DROP INDEX IF EXISTS idx_cursos_docente;
CREATE INDEX IF NOT EXISTS idx_asignaturas_programa ON asignaturas(programa_id);
CREATE INDEX IF NOT EXISTS idx_asignaturas_docente ON asignaturas(docente_id);
