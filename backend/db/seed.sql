-- Seed data for Proyecto Docente Database
-- UTF-8 encoding support
SET client_encoding = 'UTF8';

-- Reset sequences
SELECT setval('facultades_id_seq', 1, false);
SELECT setval('programas_academicos_id_seq', 1, false);
SELECT setval('cursos_id_seq', 1, false);
SELECT setval('usuarios_id_seq', 1, false);
SELECT setval('proyectos_docente_id_seq', 1, false);
SELECT setval('formatos_id_seq', 1, false);
SELECT setval('contenido_curso_id_seq', 1, false);
SELECT setval('observaciones_id_seq', 1, false);
SELECT setval('bibliografia_id_seq', 1, false);
SELECT setval('resultados_aprendizaje_id_seq', 1, false);
SELECT setval('resultados_aprendizaje_curso_id_seq', 1, false);
SELECT setval('resultados_aprendizaje_asignatura_id_seq', 1, false);
SELECT setval('seguimiento_id_seq', 1, false);

-- Facultades
INSERT INTO facultades (id, nombre) VALUES
(1, 'Ingeniería'),
(2, 'Ciencias Exactas y Naturales'),
(3, 'Ciencias de la Educación'),
(4, 'Ciencias Económicas'),
(5, 'Derecho');

-- Programas Académicos
INSERT INTO programas_academicos (id, nombre, modalidad, jornada, plan_estudio, facultad_id) VALUES
(1, 'Ingeniería de Sistemas', 'presencial', 'diurna', 2024, 1),
(2, 'Ingeniería Química', 'presencial', 'diurna', 2023, 1),
(3, 'Matemáticas', 'presencial', 'diurna', 2022, 2),
(4, 'Licenciatura en Matemáticas', 'presencial', 'diurna', 2024, 3),
(5, 'Administración de Empresas', 'presencial', 'nocturna', 2023, 4),
(6, 'Derecho', 'presencial', 'diurna', 2024, 5);

-- Usuarios (all roles)
INSERT INTO usuarios (id, nombre, apellido, email, password_hash, rol, programa_id, facultad_id) VALUES
(1, 'Juan', 'Pérez', 'docente@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DOCENTE', 1, 1),
(2, 'María', 'García', 'jefe@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'JEFE_DEPARTAMENTO', 1, 1),
(3, 'Carlos', 'Rodríguez', 'director@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DIRECTOR_PROGRAMA', 1, 1),
(4, 'Ana', 'Martínez', 'comite@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'COMITE_CURRICULAR', NULL, 1),
(5, 'Pedro', 'López', 'decano@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DECANO', NULL, 1),
(6, 'Laura', 'Sánchez', 'estudiante@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'ESTUDIANTE', 1, 1),
(7, 'Admin', 'Sistema', 'admin@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'ADMIN', NULL, NULL),
(8, 'Roberto', 'Fernández', 'coordinador@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'COORDINADOR_PROGRAMA', 1, 1),
(9, 'Miguel', 'Torres', 'comite_academico@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'COMITE_ACADEMICO_INSTITUTO', NULL, 1),
(10, 'Paula', 'Corrales', 'docente2@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DOCENTE', 2, 1);

-- Asignaturas
INSERT INTO asignaturas (id, nombre, componente, creditos, total_horas, tipo, prerrequisitos, correquisitos, periodo_academico, programa_id, docente_id, codigo, area, horas_ti, horas_tde, horas_tdp, semanas) VALUES
(1, 'Programación I', 'Específico', 4, 192, 'Obligatorio', NULL, NULL, '2026-1', 1, 1, 'IA1010', 'Ciencias Básicas', 96, 48, 48, 16),
(2, 'Estructuras de Datos', 'Específico', 4, 192, 'Obligatorio', 'Programación I', NULL, '2026-1', 1, 1, 'IA1020', 'Ciencias Básicas', 96, 48, 48, 16),
(3, 'Bases de Datos', 'Específico', 3, 144, 'Obligatorio', 'Estructuras de Datos', NULL, '2026-1', 1, 1, 'IA1040', 'Formación Profesional', 72, 36, 36, 16),
(4, 'Auditoría de Sistemas', 'Específico', 3, 144, 'Obligatorio', NULL, NULL, '2026-1', 1, 1, 'IA1030', 'Formación Profesional', 72, 36, 36, 16),
(5, 'Control de Procesos', 'Específico', 3, 144, 'Obligatorio', NULL, NULL, '2026-1', 2, 10, 'IQ1010', 'Formación Profesional', 72, 36, 36, 16);

-- Resultados de Aprendizaje por Programa
INSERT INTO resultados_aprendizaje (id, programa_id, codigo, descripcion) VALUES
(1, 1, 'RA1', 'Capacidad de identificar, formular y resolver problemas complejos de Ingeniería de Sistemas mediante la aplicación de principios de ingeniería, ciencia y matemática.'),
(2, 1, 'RA2', 'Capacidad de aplicar el diseño de Ingeniería para producir soluciones que satisfagan necesidades específicas teniendo en cuenta la salud pública, la seguridad y el bienestar.'),
(3, 1, 'RA3', 'Capacidad de comunicarse efectivamente con un rango de audiencia profesional y en equipos multidisciplinarios.'),
(4, 1, 'RA4', 'Capacidad de reconocer responsabilidades éticas y profesionales en situaciones en el contexto de la Ingeniería de Sistemas.'),
(5, 1, 'RA5', 'Capacidad de funcionar eficazmente en equipos multidisciplinarios y de ingeniería.'),
(6, 2, 'RA-IQ-01', 'Diseña y optimiza procesos químicos industriales considerando aspectos técnicos, económicos y ambientales'),
(7, 2, 'RA-IQ-02', 'Aplica principios de termodinámica y cinética química para modelar y controlar procesos de transformación');

-- Resultados de Aprendizaje por Asignatura
INSERT INTO resultados_aprendizaje_asignatura (id, resultado_aprendizaje_id, asignatura_id) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 2, 2),
(4, 4, 2),
(5, 6, 5),
(6, 7, 5);

-- Proyectos Docente
INSERT INTO proyectos_docente (id, asignatura_id, version, estado, creacion, ultima_modificacion, docente_id, estado_jefedept, estado_director, estado_comite, estado_decano, sesiones_por_semana, activo) VALUES
(1, 1, 1, 'APROBADO', '2026-05-23 18:56:00', '2026-05-23 21:08:54', 1, 'APROBADO', 'APROBADO', 'APROBADO', 'APROBADO', 1, true),
(2, 2, 1, 'APROBADO', '2026-05-23 21:39:38', '2026-05-23 22:15:51', 1, 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 1, true),
(3, 3, 1, 'APROBADO', '2026-05-27 08:55:27', '2026-05-28 14:10:54', 1, 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 1, true),
(4, 4, 1, 'APROBADO', '2026-05-27 08:13:10', '2026-05-28 14:10:55', 1, 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 2, true),
(5, 5, 1, 'APROBADO', '2026-05-27 08:55:27', '2026-05-28 14:10:54', 10, 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 'PENDIENTE', 1, true);

-- Resultados de Aprendizaje por Curso
INSERT INTO resultados_aprendizaje_curso (id, proyecto_docente_id, resultado_curso, contribucion_programa, resultado_aprendizaje_id) VALUES
(1, 1, 'Resultado de curso 1', 'Contribución alta', 1),
(2, 1, 'Resultado de curso 2', 'Contribución media', 2),
(3, 2, 'Resultado de curso 1', 'Contribución alta', 2),
(4, 2, 'Resultado de curso 2', 'Contribución media', 4);

-- Contenido Curso (with sesion field)
INSERT INTO contenido_curso (id, proyecto_docente_id, semana, tema, descripcion, observaciones, sesion) VALUES
(1, 1, 1, 'Tema 1', 'Descripción del tema 1', NULL, 1),
(2, 1, 2, 'Tema 2', 'Descripción del tema 2', NULL, 1),
(3, 1, 3, 'Tema 3', 'Descripción del tema 3', NULL, 1),
(4, 1, 4, 'Tema 4', 'Descripción del tema 4', NULL, 1),
(5, 2, 1, 'Tema 1', 'Descripción del tema 1', NULL, 1),
(6, 2, 2, 'Tema 2', 'Descripción del tema 2', NULL, 1),
(7, 2, 3, 'Tema 3', 'Descripción del tema 3', NULL, 1),
(8, 2, 4, 'Tema 4', 'Descripción del tema 4', NULL, 1),
(9, 4, 1, 'Generalidades de Auditoría', 'Evolución de la auditoría, control interno, alcance y objetivos', NULL, 1),
(10, 4, 2, 'Estándares de TI', 'Categorías de estándares, organismos de estandarización', NULL, 1),
(11, 4, 3, 'Normas legales', 'Normas relacionadas con la práctica profesional', NULL, 1),
(12, 4, 4, 'Análisis de riesgos', 'Matrices de control: Delphy y DOFA', NULL, 1);

-- Seguimiento (with new fields: tema_desarrollado, descripcion_tema, modalidad_entorno, modalidad_sincronia, modalidad_enfoque)
INSERT INTO seguimiento (id, proyecto_docente_id, asignatura_id, docente_id, fecha, tema_desarrollado, descripcion_tema, porcentaje_avance, estado, reporte, observaciones, semana, sesion, modalidad_entorno, modalidad_sincronia, modalidad_enfoque) VALUES
(1, 2, 2, 1, '2026-05-27', 'Estructuras de datos básicas', 'Introducción a arrays y listas', 5, 'CUMPLIDO', NULL, 'Ninguna', 1, 1, 'Presencial', 'Sincrónica', 'Magistral o expositiva'),
(2, 2, 2, 1, '2026-05-28', 'Pilas y colas', 'Implementación de estructuras LIFO y FIFO', 5, 'CUMPLIDO', NULL, 'Se hizo virtual', 1, 2, 'Virtual o en línea', 'Sincrónica', 'Activa o participativa'),
(3, 2, 2, 1, '2026-05-29', 'Árboles binarios', 'Introducción a árboles y recorridos', 5, 'CUMPLIDO', NULL, 'No hay', 1, 3, 'Presencial', 'Sincrónica', 'Por proyectos (ABP)'),
(4, 1, 1, 1, '2026-06-01', 'Fundamentos de programación', 'Variables, tipos de datos y operadores', 6, 'CUMPLIDO', NULL, 'Ninguna', 1, 1, 'Presencial', 'Sincrónica', 'Magistral o expositiva'),
(5, 4, 4, 1, '2026-06-02', 'Auditoría de sistemas', 'Introducción a la auditoría', 5, 'CUMPLIDO', NULL, 'Buen avance', 1, 1, 'Semipresencial o híbrida', 'Sincrónica', 'Invertida (Flipped Classroom)'),
(6, 4, 4, 1, '2026-06-03', 'Estándares ISO', 'Normas ISO 27001', 5, 'PENDIENTE', NULL, 'Pendiente evaluación', 1, 2, 'Virtual o en línea', 'Asincrónica', 'Activa o participativa');

-- Bibliografía
INSERT INTO bibliografia (id, proyecto_docente_id, referencia, tipo, url) VALUES
(1, 1, 'Bibliografía básica 1', 'BASICA', NULL),
(2, 1, 'Bibliografía básica 2', 'BASICA', NULL),
(3, 1, 'Bibliografía complementaria', 'COMPLEMENTARIA', NULL),
(4, 2, 'Bibliografía 1', 'BASICA', NULL),
(5, 2, 'Bibliografía 2', 'COMPLEMENTARIA', NULL),
(6, 4, 'Amarante David (2022), Auditoría de Sistemas de Información', 'BASICA', NULL),
(7, 4, 'Menéndez Arenantes Silvia (2023). Auditoría de Seguridad Informática', 'BASICA', NULL);

-- Formos
INSERT INTO formatos (id, proyecto_docente_id, descripcion, resultados_aprendizaje, estrategias, evaluacion_resultados, tipo) VALUES
(1, 1, 'Descripción del formato', 'Resultado 1\nResultado 2', 'Estrategia 1\nEstrategia 2', 'Criterio 1\nCriterio 2', NULL),
(2, 2, 'Descripción del formato', 'Resultado 1\nResultado 2', 'Metodología 1\nMetodología 2', 'Criterio 1\nCriterio 2', NULL),
(3, 4, 'Descripción detallada del curso', 'Capacidad de identificar normas legales\nCapacidad de aplicar estándares', 'Aprendizaje basado en problemas\nDiscusiones y debates', 'Proyecto de aula\nEvaluaciones escritas', NULL);

-- Observaciones
INSERT INTO observaciones (id, proyecto_docente_id, autor_id, tipo, descripcion, fecha) VALUES
(1, 2, 2, 'DEVOLUCION', 'Por favor revisar la sección de metodología', '2026-05-28 10:00:00'),
(2, 2, 3, 'APROBACION', 'Aprobado para revisión del comité', '2026-05-29 15:30:00'),
(3, 1, 4, 'COMENTARIO', 'Buen trabajo en la sección de resultados', '2026-06-01 09:00:00');
