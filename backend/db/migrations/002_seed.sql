-- Seed data for testing

-- Facultades
INSERT INTO facultades (nombre) VALUES 
('Ingeniería'),
('Ciencias Exactas y Naturales'),
('Ciencias de la Educación'),
('Ciencias Económicas'),
('Derecho');

-- Programas Académicos
INSERT INTO programas_academicos (nombre, modalidad, jornada, plan_estudio, facultad_id) VALUES 
('Ingeniería de Sistemas', 'presencial', 'diurna', 2024, 1),
('Ingeniería Civil', 'presencial', 'diurna', 2023, 1),
('Matemáticas', 'presencial', 'diurna', 2022, 2),
('Licenciatura en Matemáticas', 'presencial', 'diurna', 2024, 3),
('Administración de Empresas', 'presencial', 'nocturna', 2023, 4),
('Derecho', 'presencial', 'diurna', 2024, 5);

-- Usuarios (passwords are hashed with bcrypt, default is "password123")
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, programa_id, facultad_id) VALUES
('Juan', 'Pérez', 'docente@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DOCENTE', 1, 1),
('María', 'García', 'jefe@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'JEFE_DEPARTAMENTO', 1, 1),
('Carlos', 'Rodríguez', 'director@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DIRECTOR_PROGRAMA', 1, 1),
('Roberto', 'Fernández', 'coordinador@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'COORDINADOR_PROGRAMA', 1, 1),
('Ana', 'Martínez', 'comite@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'COMITE_CURRICULAR', NULL, 1),
('Miguel', 'Torres', 'comite_academico@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'COMITE_ACADEMICO_INSTITUTO', NULL, 1),
('Pedro', 'López', 'decano@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'DECANO', NULL, 1),
('Laura', 'Sánchez', 'estudiante@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'ESTUDIANTE', 1, 1),
('Admin', 'Sistema', 'admin@unicartagena.edu.co', '$2a$10$sQSV1GvhVdEnKecjxHYU6OiPvCBcOOwlLskvJ6ShMkYsG7B5xk1He', 'ADMIN', NULL, NULL);

-- Cursos
INSERT INTO cursos (nombre, componente, creditos, total_horas, tipo, prerrequisitos, correquisitos, periodo_academico, programa_id, docente_id) VALUES 
('Programación I', 'Ciencias Básicas', 4, 64, 'teórico-práctico', NULL, NULL, '2025-1', 1, 1),
('Estructuras de Datos', 'Ciencias Básicas', 4, 64, 'teórico-práctico', 'Programación I', NULL, '2025-1', 1, 1),
('Bases de Datos', 'Formación Profesional', 3, 48, 'teórico-práctico', 'Estructuras de Datos', NULL, '2025-1', 1, 1);
