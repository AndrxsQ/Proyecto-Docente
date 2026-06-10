-- Schema for Proyecto Docente Database
-- UTF-8 encoding support
SET client_encoding = 'UTF8';

-- Sequences
CREATE SEQUENCE IF NOT EXISTS facultades_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS programas_academicos_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS cursos_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS usuarios_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS proyectos_docente_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS formatos_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS contenido_curso_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS observaciones_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS bibliografia_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS resultados_aprendizaje_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS resultados_aprendizaje_curso_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS resultados_aprendizaje_asignatura_id_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS seguimiento_id_seq START WITH 1 INCREMENT BY 1;

-- Tables
CREATE TABLE IF NOT EXISTS facultades (
    id INTEGER PRIMARY KEY DEFAULT nextval('facultades_id_seq'),
    nombre VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS programas_academicos (
    id INTEGER PRIMARY KEY DEFAULT nextval('programas_academicos_id_seq'),
    nombre VARCHAR(255) NOT NULL,
    modalidad VARCHAR(50) NOT NULL CHECK (modalidad IN ('presencial', 'virtual', 'mixta')),
    jornada VARCHAR(50) NOT NULL CHECK (jornada IN ('diurna', 'nocturna')),
    plan_estudio INTEGER NOT NULL,
    facultad_id INTEGER NOT NULL,
    FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asignaturas (
    id INTEGER PRIMARY KEY DEFAULT nextval('cursos_id_seq'),
    nombre VARCHAR(255) NOT NULL,
    componente VARCHAR(255),
    creditos INTEGER NOT NULL,
    total_horas INTEGER NOT NULL,
    tipo VARCHAR(255) CHECK (tipo IN ('Obligatorio', 'Opcional')),
    prerrequisitos TEXT,
    correquisitos TEXT,
    periodo_academico VARCHAR(50) NOT NULL,
    programa_id INTEGER NOT NULL,
    docente_id INTEGER,
    codigo VARCHAR(50),
    area VARCHAR(100),
    horas_ti INTEGER DEFAULT 0,
    horas_tde INTEGER DEFAULT 0,
    horas_tdp INTEGER DEFAULT 0,
    semanas INTEGER DEFAULT 16,
    FOREIGN KEY (programa_id) REFERENCES programas_academicos(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY DEFAULT nextval('usuarios_id_seq'),
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('DOCENTE', 'JEFE_DEPARTAMENTO', 'DIRECTOR_PROGRAMA', 'COORDINADOR_PROGRAMA', 'COMITE_CURRICULAR', 'COMITE_ACADEMICO_INSTITUTO', 'DECANO', 'ESTUDIANTE', 'ADMIN')),
    programa_id INTEGER,
    facultad_id INTEGER,
    FOREIGN KEY (programa_id) REFERENCES programas_academicos(id) ON DELETE SET NULL,
    FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS proyectos_docente (
    id INTEGER PRIMARY KEY DEFAULT nextval('proyectos_docente_id_seq'),
    asignatura_id INTEGER NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    estado VARCHAR(50) DEFAULT 'BORRADOR' NOT NULL CHECK (estado IN ('ELABORADO', 'EN_REVISION', 'REVISADO', 'AVALADO', 'APROBADO', 'DENEGADO')),
    creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    docente_id INTEGER NOT NULL,
    estado_jefedept VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado_jefedept IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    estado_director VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado_director IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    estado_comite VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado_comite IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    estado_decano VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado_decano IN ('PENDIENTE', 'APROBADO', 'DEVUELTO')),
    sesiones_por_semana INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE (asignatura_id, version)
);

CREATE TABLE IF NOT EXISTS formatos (
    id INTEGER PRIMARY KEY DEFAULT nextval('formatos_id_seq'),
    proyecto_docente_id INTEGER NOT NULL,
    descripcion TEXT,
    resultados_aprendizaje TEXT,
    estrategias TEXT,
    evaluacion_resultados TEXT,
    tipo VARCHAR(100),
    FOREIGN KEY (proyecto_docente_id) REFERENCES proyectos_docente(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contenido_curso (
    id INTEGER PRIMARY KEY DEFAULT nextval('contenido_curso_id_seq'),
    proyecto_docente_id INTEGER NOT NULL,
    semana INTEGER NOT NULL,
    tema VARCHAR(255) NOT NULL,
    descripcion TEXT,
    observaciones TEXT,
    sesion INTEGER DEFAULT 1,
    FOREIGN KEY (proyecto_docente_id) REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    UNIQUE (proyecto_docente_id, semana)
);

CREATE TABLE IF NOT EXISTS observaciones (
    id INTEGER PRIMARY KEY DEFAULT nextval('observaciones_id_seq'),
    proyecto_docente_id INTEGER NOT NULL,
    autor_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DEVOLUCION', 'COMENTARIO', 'APROBACION', 'DENEGACION')),
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (proyecto_docente_id) REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bibliografia (
    id INTEGER PRIMARY KEY DEFAULT nextval('bibliografia_id_seq'),
    proyecto_docente_id INTEGER NOT NULL,
    referencia TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('BASICA', 'COMPLEMENTARIA')),
    url TEXT,
    FOREIGN KEY (proyecto_docente_id) REFERENCES proyectos_docente(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resultados_aprendizaje (
    id INTEGER PRIMARY KEY DEFAULT nextval('resultados_aprendizaje_id_seq'),
    programa_id INTEGER NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    FOREIGN KEY (programa_id) REFERENCES programas_academicos(id) ON DELETE CASCADE,
    UNIQUE (programa_id, codigo)
);

CREATE TABLE IF NOT EXISTS resultados_aprendizaje_curso (
    id INTEGER PRIMARY KEY DEFAULT nextval('resultados_aprendizaje_curso_id_seq'),
    proyecto_docente_id INTEGER NOT NULL,
    resultado_curso TEXT NOT NULL,
    contribucion_programa TEXT NOT NULL,
    resultado_aprendizaje_id INTEGER,
    FOREIGN KEY (proyecto_docente_id) REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    FOREIGN KEY (resultado_aprendizaje_id) REFERENCES resultados_aprendizaje(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resultados_aprendizaje_asignatura (
    id INTEGER PRIMARY KEY DEFAULT nextval('resultados_aprendizaje_asignatura_id_seq'),
    resultado_aprendizaje_id INTEGER NOT NULL,
    asignatura_id INTEGER NOT NULL,
    FOREIGN KEY (resultado_aprendizaje_id) REFERENCES resultados_aprendizaje(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
    UNIQUE (resultado_aprendizaje_id, asignatura_id)
);

CREATE TABLE IF NOT EXISTS seguimiento (
    id INTEGER PRIMARY KEY DEFAULT nextval('seguimiento_id_seq'),
    proyecto_docente_id INTEGER NOT NULL,
    asignatura_id INTEGER NOT NULL,
    docente_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tema_desarrollado TEXT,
    descripcion_tema TEXT,
    porcentaje_avance INTEGER NOT NULL CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('CUMPLIDO', 'PENDIENTE', 'REPROGRAMADO')),
    reporte TEXT,
    observaciones TEXT,
    semana INTEGER DEFAULT 1,
    sesion INTEGER DEFAULT 1,
    modalidad_entorno VARCHAR(100),
    modalidad_sincronia VARCHAR(50),
    modalidad_enfoque VARCHAR(100),
    FOREIGN KEY (proyecto_docente_id) REFERENCES proyectos_docente(id) ON DELETE CASCADE,
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_asignaturas_programa ON asignaturas(programa_id);
CREATE INDEX IF NOT EXISTS idx_asignaturas_docente ON asignaturas(docente_id);
CREATE INDEX IF NOT EXISTS idx_cursos_periodo ON asignaturas(periodo_academico);
CREATE INDEX IF NOT EXISTS idx_proyectos_curso ON proyectos_docente(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_docente ON proyectos_docente(docente_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos_docente(estado);
CREATE INDEX IF NOT EXISTS idx_contenido_proyecto ON contenido_curso(proyecto_docente_id);
CREATE INDEX IF NOT EXISTS idx_observaciones_proyecto ON observaciones(proyecto_docente_id);
CREATE INDEX IF NOT EXISTS idx_bibliografia_proyecto ON bibliografia(proyecto_docente_id);
CREATE INDEX IF NOT EXISTS idx_resultados_aprendizaje_proyecto ON resultados_aprendizaje_curso(proyecto_docente_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_proyecto ON seguimiento(proyecto_docente_id);
CREATE INDEX IF NOT EXISTS idx_seguimiento_curso ON seguimiento(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_programa ON usuarios(programa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_facultad ON usuarios(facultad_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
