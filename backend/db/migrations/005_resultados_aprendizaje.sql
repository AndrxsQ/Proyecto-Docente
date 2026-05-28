-- Create table for learning results (resultados de aprendizaje)
CREATE TABLE IF NOT EXISTS resultados_aprendizaje_curso (
    id SERIAL PRIMARY KEY,
    proyecto_docente_id INTEGER NOT NULL REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    resultado_curso TEXT NOT NULL,
    contribucion_programa TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resultados_aprendizaje_proyecto ON resultados_aprendizaje_curso(proyecto_docente_id);
