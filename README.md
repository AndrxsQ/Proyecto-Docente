# Sistema de Gestión Documental - Proyecto Docente

Sistema para la gestión de proyectos docentes de la Universidad de Cartagena, permitiendo la creación, revisión, aprobación y seguimiento de proyectos docentes con control de roles y estados.

## Características

- **Backend en Go**: API REST con arquitectura en capas (models, repository, service, handlers)
- **Frontend en React**: SPA con React Router, Tailwind CSS y Axios
- **Base de Datos**: PostgreSQL con migraciones SQL y seed data
- **Autenticación**: JWT con middleware de autenticación y autorización por roles
- **Control de Estados**: Máquina de estados para el flujo de aprobación de proyectos
- **Seguimiento de Clases**: Registro de seguimiento para proyectos aprobados
- **Manejo Robusto de Errores**: Null checks y manejo defensivo en el frontend para prevenir crashes
- **Actualización Optimista**: Actualización inmediata del estado local para mejor UX
- **Advertencia de Cambios**: Alerta al intentar salir con cambios no guardados
- **Campos Nullable**: Soporte para campos opcionales en la base de datos (prerrequisitos, correquisitos, fechas)

## Roles del Sistema

Los roles están organizados en grupos de permisos para simplificar la gestión:

**Grupo DOCENTE:**
- **DOCENTE**: Crea y edita proyectos docente, envía para revisión

**Grupo REVISION (mismos permisos):**
- **JEFE_DEPARTAMENTO**: Revisa proyectos (EN_REVISION → REVISADO)
- **DIRECTOR_PROGRAMA**: Revisa proyectos (EN_REVISION → REVISADO)
- **COORDINADOR_PROGRAMA**: Revisa proyectos (EN_REVISION → REVISADO)

**Grupo COMITE (mismos permisos):**
- **COMITE_CURRICULAR**: Verifica proyectos (REVISADO → AVALADO)
- **COMITE_ACADEMICO_INSTITUTO**: Verifica proyectos (REVISADO → AVALADO)

**Grupo APROBACION_FINAL:**
- **DECANO**: Aprueba proyectos finales (AVALADO → APROBADO)

**Otros roles:**
- **ESTUDIANTE**: Consulta proyectos aprobados
- **ADMIN**: Gestiona usuarios, cursos y programas

## Estados del Proyecto (Flujo Simplificado)

1. **ELABORADO**: Proyecto en creación por el docente (antes de enviar a revisión)
2. **EN_REVISION**: Una vez el docente lo envía a revisión
3. **REVISADO**: Una vez el Jefe de Departamento, Director de Programa o Coordinador de Programa lo revisa
4. **AVALADO**: Una vez el Comité Curricular o Comité Académico de Instituto lo verifica
5. **APROBADO**: Una vez el Decano o Comité Académico de Instituto lo aprueba

**Flujo de Aprobación:**
- DOCENTE envía: ELABORADO → EN_REVISION
- Grupo REVISION (Jefe/Director/Coordinador) revisa: EN_REVISION → REVISADO
- Grupo COMITE (Comité Curricular/Comité Académico) verifica: REVISADO → AVALADO
- Grupo APROBACION_FINAL (Decano/Comité Académico) aprueba: AVALADO → APROBADO

**Nota:** La acción de aprobar es la misma para todos los grupos, pero la terminología cambia según el estado: "Revisar" para el grupo REVISION, "Verificar" para el grupo COMITE, y "Aprobar" para el grupo APROBACION_FINAL.

## Mejoras Recientes

- **Manejo de Errores en Frontend**: Implementación de null checks y optional chaining para prevenir crashes cuando los datos no están disponibles
- **Actualización Optimista del Estado**: Los inputs responden inmediatamente mientras se guardan los cambios en segundo plano
- **Advertencia de Cambios No Guardados**: Alerta del navegador al intentar recargar o cerrar la página con cambios sin guardar
- **Campos Nullable en Backend**: Soporte para campos opcionales como prerrequisitos, correquisitos y fechas en la base de datos
- **Corrección de Handlers**: Extracción correcta de IDs de URL en handlers de contenido (Update y Delete)
- **Seed Data con Hashes Válidos**: Contraseñas con bcrypt correctamente generadas para usuarios de prueba

## Estructura del Proyecto

```
codigoFuente/
├── backend/
│   ├── cmd/server/
│   │   └── main.go
│   ├── internal/
│   │   ├── auth/
│   │   │   └── middleware.go
│   │   ├── handlers/
│   │   │   ├── auth_handler.go
│   │   │   ├── proyecto_docente_handler.go
│   │   │   ├── formato_handler.go
│   │   │   ├── contenido_handler.go
│   │   │   ├── bibliografia_handler.go
│   │   │   ├── seguimiento_handler.go
│   │   │   ├── curso_handler.go
│   │   │   ├── usuario_handler.go
│   │   │   ├── facultad_handler.go
│   │   │   └── programa_handler.go
│   │   ├── models/
│   │   │   └── models.go
│   │   ├── repository/
│   │   │   ├── database.go
│   │   │   ├── auth_repository.go
│   │   │   ├── proyecto_docente_repository.go
│   │   │   ├── formato_repository.go
│   │   │   ├── contenido_repository.go
│   │   │   ├── bibliografia_repository.go
│   │   │   ├── seguimiento_repository.go
│   │   │   ├── observacion_repository.go
│   │   │   ├── curso_repository.go
│   │   │   ├── usuario_repository.go
│   │   │   ├── facultad_repository.go
│   │   │   └── programa_repository.go
│   │   └── service/
│   │       ├── auth_service.go
│   │       ├── proyecto_docente_service.go
│   │       ├── formato_service.go
│   │       ├── contenido_service.go
│   │       ├── bibliografia_service.go
│   │       ├── seguimiento_service.go
│   │       ├── curso_service.go
│   │       ├── usuario_service.go
│   │       ├── facultad_service.go
│   │       └── programa_service.go
│   ├── db/
│   │   └── migrations/
│   │       ├── 001_init.sql
│   │       └── 002_seed.sql
│   ├── go.mod
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── proyectosDocente.js
│   │   │   ├── cursos.js
│   │   │   ├── usuarios.js
│   │   │   ├── facultades.js
│   │   │   └── programas.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProyectoDocente/
│   │   │   │   ├── List.jsx
│   │   │   │   ├── Editor.jsx
│   │   │   │   ├── Review.jsx
│   │   │   │   └── Detail.jsx
│   │   │   ├── Seguimiento/
│   │   │   │   ├── List.jsx
│   │   │   │   └── Form.jsx
│   │   │   └── Admin/
│   │   │       ├── Usuarios.jsx
│   │   │       ├── Cursos.jsx
│   │   │       └── Programas.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Requisitos Previos

- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- Docker y Docker Compose (opcional)

## Instalación y Ejecución

### Opción 1: Docker Compose (Recomendado)

1. Clonar el repositorio
2. Ejecutar con Docker Compose:
```bash
docker-compose up -d
```
3. El backend estará disponible en http://localhost:8080
4. El frontend estará disponible en http://localhost:5173

### Opción 2: Ejecución Local

#### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
go mod download
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con la configuración deseada
```

4. Ejecutar migraciones de la base de datos:
```bash
psql -U postgres -d proyecto_docente -f db/migrations/001_init.sql
psql -U postgres -d proyecto_docente -f db/migrations/002_seed.sql
```

5. Ejecutar el servidor:
```bash
go run cmd/server/main.go
```

#### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

4. Abrir http://localhost:5173 en el navegador

## Usuarios de Prueba

El seed data incluye los siguientes usuarios de prueba (contraseña: `password123`):

- **Docente**: docente@unicartagena.edu.co
- **Jefe de Departamento**: jefe@unicartagena.edu.co
- **Director de Programa**: director@unicartagena.edu.co
- **Coordinador de Programa**: coordinador@unicartagena.edu.co
- **Comité Curricular**: comite@unicartagena.edu.co
- **Comité Académico de Instituto**: comite_academico@unicartagena.edu.co
- **Decano**: decano@unicartagena.edu.co
- **Estudiante**: estudiante@unicartagena.edu.co
- **Admin**: admin@unicartagena.edu.co

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Proyectos Docente
- `GET /api/proyectos-docentes` - Listar proyectos
- `GET /api/proyectos-docentes/:id` - Obtener proyecto
- `POST /api/proyectos-docentes` - Crear proyecto
- `POST /api/proyectos-docentes/:id/enviar` - Enviar para revisión
- `POST /api/proyectos-docentes/:id/aprobar` - Aprobar proyecto
- `POST /api/proyectos-docentes/:id/devolver` - Devolver con observaciones

### Formato
- `GET /api/proyectos-docentes/:id/formato` - Obtener formato
- `POST /api/proyectos-docentes/:id/formato` - Guardar formato

### Contenido
- `GET /api/proyectos-docentes/:id/contenido` - Listar contenido
- `POST /api/proyectos-docentes/:id/contenido` - Agregar contenido
- `PUT /api/proyectos-docentes/:id/contenido/:semana_id` - Actualizar contenido
- `DELETE /api/proyectos-docentes/:id/contenido/:semana_id` - Eliminar contenido

### Bibliografía
- `GET /api/proyectos-docentes/:id/bibliografia` - Listar bibliografía
- `POST /api/proyectos-docentes/:id/bibliografia` - Agregar referencia
- `PUT /api/proyectos-docentes/:id/bibliografia/:bib_id` - Actualizar referencia
- `DELETE /api/proyectos-docentes/:id/bibliografia/:bib_id` - Eliminar referencia

### Seguimiento
- `GET /api/proyectos-docentes/:id/seguimiento` - Listar seguimiento
- `POST /api/proyectos-docentes/:id/seguimiento` - Agregar registro
- `PUT /api/proyectos-docentes/:id/seguimiento/:seg_id` - Actualizar registro

### Cursos
- `GET /api/cursos` - Listar cursos
- `GET /api/cursos/:id` - Obtener curso
- `POST /api/cursos` - Crear curso (Admin)
- `PUT /api/cursos/:id` - Actualizar curso (Admin)

### Usuarios
- `GET /api/usuarios` - Listar usuarios (Admin)
- `GET /api/usuarios/:id` - Obtener usuario (Admin)
- `POST /api/usuarios` - Crear usuario (Admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (Admin)

### Programas
- `GET /api/programas` - Listar programas
- `GET /api/programas/:id` - Obtener programa
- `POST /api/programas` - Crear programa (Admin)
- `PUT /api/programas/:id` - Actualizar programa (Admin)
- `DELETE /api/programas/:id` - Eliminar programa (Admin)

### Facultades
- `GET /api/facultades` - Listar facultades
- `POST /api/facultades` - Crear facultad (Admin)
- `PUT /api/facultades/:id` - Actualizar facultad (Admin)
- `DELETE /api/facultades/:id` - Eliminar facultad (Admin)

## Tecnologías

### Backend
- Go 1.21
- PostgreSQL
- JWT (github.com/golang-jwt/jwt/v5)
- Gorilla Mux (github.com/gorilla/mux)
- bcrypt (golang.org/x/crypto/bcrypt)

### Frontend
- React 18
- React Router 6
- Tailwind CSS
- Axios
- Lucide React (iconos)
- Vite

## Licencia

Este proyecto es para uso académico de la Universidad de Cartagena.
