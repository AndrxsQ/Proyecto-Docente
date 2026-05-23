-- Create tables for Proyecto Docente system

-- Facultades
CREATE TABLE IF NOT EXISTS facultades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);

-- Programas Académicos
CREATE TABLE IF NOT EXISTS programas_academicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    modalidad VARCHAR(50) NOT NULL CHECK (modalidad IN ('presencial', 'virtual', 'mixta')),
    jornada VARCHAR(50) NOT NULL CHECK (jornada IN ('diurna', 'nocturna')),
    plan_estudio INTEGER NOT NULL,
    facultad_id INTEGER NOT NULL REFERENCES facultades(id) ON DELETE CASCADE
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('DOCENTE', 'JEFE_DEPARTAMENTO', 'DIRECTOR_PROGRAMA', 'COORDINADOR_PROGRAMA', 'COMITE_CURRICULAR', 'DECANO', 'ESTUDIANTE', 'ADMIN')),
    programa_id INTEGER REFERENCES programas_academicos(id) ON DELETE SET NULL,
    facultad_id INTEGER REFERENCES facultades(id) ON DELETE SET NULL
);

-- Cursos
CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    componente VARCHAR(255),
    creditos INTEGER NOT NULL,
    total_horas INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('teórico', 'práctico', 'teórico-práctico')),
    prerrequisitos TEXT,
    correquisitos TEXT,
    periodo_academico VARCHAR(50) NOT NULL,
    programa_id INTEGER NOT NULL REFERENCES programas_academicos(id) ON DELETE CASCADE,
    docente_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Proyectos Docente
CREATE TABLE IF NOT EXISTS proyectos_docente (
    id SERIAL PRIMARY KEY,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    estado VARCHAR(50) NOT NULL CHECK (estado IN ('BORRADOR', 'EN_REVISION_JEFE', 'EN_REVISION_COMITE', 'DEVUELTO_DOCENTE', 'EN_APROBACION_DECANO', 'APROBADO')) DEFAULT 'BORRADOR',
    creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    docente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estado_jefedept VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_jefedept IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    estado_director VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_director IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    estado_comite VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_comite IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    estado_decano VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_decano IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    UNIQUE(curso_id, version)
);

-- Formato del Proyecto Docente
CREATE TABLE IF NOT EXISTS formatos (
    id SERIAL PRIMARY KEY,
    proyecto_docente_id INTEGER NOT NULL REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    descripcion TEXT,
    resultados_aprendizaje TEXT,
    estrategias TEXT,
    evaluacion_resultados TEXT,
    tipo VARCHAR(100)
);

-- Contenido del Curso (semanal)
CREATE TABLE IF NOT EXISTS contenido_curso (
    id SERIAL PRIMARY KEY,
    proyecto_docente_id INTEGER NOT NULL REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL,
    tema VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE,
    observaciones TEXT,
    UNIQUE(proyecto_docente_id, semana)
);

-- Seguimiento de clases
CREATE TABLE IF NOT EXISTS seguimiento (
    id SERIAL PRIMARY KEY,
    proyecto_docente_id INTEGER NOT NULL REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    docente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    desarrollo TEXT,
    descripcion TEXT,
    porcentaje_avance INTEGER NOT NULL CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('CUMPLIDO', 'PENDIENTE', 'REPROGRAMADO')),
    reporte TEXT,
    observaciones TEXT
);

-- Observaciones
CREATE TABLE IF NOT EXISTS observaciones (
    id SERIAL PRIMARY KEY,
    proyecto_docente_id INTEGER NOT NULL REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DEVOLUCION', 'COMENTARIO', 'APROBACION')),
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bibliografía
CREATE TABLE IF NOT EXISTS bibliografia (
    id SERIAL PRIMARY KEY,
    proyecto_docente_id INTEGER NOT NULL REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    referencia TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('BASICA', 'COMPLEMENTARIA')),
    url TEXT
);

-- Indexes for better performance
CREATE INDEX idx_cursos_programa ON cursos(programa_id);
CREATE INDEX idx_cursos_docente ON cursos(docente_id);
CREATE INDEX idx_cursos_periodo ON cursos(periodo_academico);
CREATE INDEX idx_proyectos_curso ON proyectos_docente(curso_id);
CREATE INDEX idx_proyectos_docente ON proyectos_docente(docente_id);
CREATE INDEX idx_proyectos_estado ON proyectos_docente(estado);
CREATE INDEX idx_contenido_proyecto ON contenido_curso(proyecto_docente_id);
CREATE INDEX idx_seguimiento_proyecto ON seguimiento(proyecto_docente_id);
CREATE INDEX idx_seguimiento_curso ON seguimiento(curso_id);
CREATE INDEX idx_observaciones_proyecto ON observaciones(proyecto_docente_id);
CREATE INDEX idx_bibliografia_proyecto ON bibliografia(proyecto_docente_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_programa ON usuarios(programa_id);
CREATE INDEX idx_usuarios_facultad ON usuarios(facultad_id);
