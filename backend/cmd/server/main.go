package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"proyecto-docente/internal/auth"
	"proyecto-docente/internal/handlers"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
	"proyecto-docente/internal/service"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "proyecto_docente")
	jwtSecret := getEnv("JWT_SECRET", "secret-key-change-in-production")
	serverPort := getEnv("SERVER_PORT", "8080")

	db, err := repository.NewDB(dbHost, dbPort, dbUser, dbPassword, dbName)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	authRepo := repository.NewAuthRepository(db)
	authService := service.NewAuthService(authRepo, jwtSecret)
	authMiddleware := auth.NewAuthMiddleware(authService)

	facultadRepo := repository.NewFacultadRepository(db)
	facultadService := service.NewFacultadService(facultadRepo)
	facultadHandler := handlers.NewFacultadHandler(facultadService)

	programaRepo := repository.NewProgramaRepository(db)
	programaService := service.NewProgramaService(programaRepo)
	programaHandler := handlers.NewProgramaHandler(programaService)

	usuarioRepo := repository.NewUsuarioRepository(db)
	usuarioService := service.NewUsuarioService(usuarioRepo, authService)
	usuarioHandler := handlers.NewUsuarioHandler(usuarioService)

	asignaturaRepo := repository.NewAsignaturaRepository(db)
	asignaturaService := service.NewAsignaturaService(asignaturaRepo)
	asignaturaHandler := handlers.NewAsignaturaHandler(asignaturaService)

	formatoRepo := repository.NewFormatoRepository(db)
	formatoService := service.NewFormatoService(formatoRepo)
	formatoHandler := handlers.NewFormatoHandler(formatoService)

	contenidoRepo := repository.NewContenidoRepository(db)
	contenidoService := service.NewContenidoService(contenidoRepo)
	contenidoHandler := handlers.NewContenidoHandler(contenidoService)

	bibliografiaRepo := repository.NewBibliografiaRepository(db)
	bibliografiaService := service.NewBibliografiaService(bibliografiaRepo)
	bibliografiaHandler := handlers.NewBibliografiaHandler(bibliografiaService)

	seguimientoRepo := repository.NewSeguimientoRepository(db)
	seguimientoService := service.NewSeguimientoService(seguimientoRepo)
	seguimientoHandler := handlers.NewSeguimientoHandler(seguimientoService)

	pdRepo := repository.NewProyectoDocenteRepository(db)
	observacionRepo := repository.NewObservacionRepository(db)
	pdService := service.NewProyectoDocenteService(pdRepo, formatoRepo, contenidoRepo, bibliografiaRepo, observacionRepo)
	pdHandler := handlers.NewProyectoDocenteHandler(pdService)

	authHandler := handlers.NewAuthHandler(authService)

	r := mux.NewRouter()

	r.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/auth/me", authMiddleware.Authenticate(authHandler.GetMe)).Methods("GET")

	r.HandleFunc("/api/facultades", facultadHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/facultades", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(facultadHandler.Create))).Methods("POST")
	r.HandleFunc("/api/facultades/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(facultadHandler.Update))).Methods("PUT")
	r.HandleFunc("/api/facultades/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(facultadHandler.Delete))).Methods("DELETE")

	r.HandleFunc("/api/programas", programaHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/programas/{id}", programaHandler.GetByID).Methods("GET")
	r.HandleFunc("/api/programas", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(programaHandler.Create))).Methods("POST")
	r.HandleFunc("/api/programas/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(programaHandler.Update))).Methods("PUT")
	r.HandleFunc("/api/programas/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(programaHandler.Delete))).Methods("DELETE")

	r.HandleFunc("/api/usuarios", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(usuarioHandler.GetAll))).Methods("GET")
	r.HandleFunc("/api/usuarios/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(usuarioHandler.GetByID))).Methods("GET")
	r.HandleFunc("/api/usuarios", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(usuarioHandler.Create))).Methods("POST")
	r.HandleFunc("/api/usuarios/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(usuarioHandler.Update))).Methods("PUT")

	r.HandleFunc("/api/asignaturas", asignaturaHandler.GetAll).Methods("GET")
	r.HandleFunc("/api/asignaturas/{id}", asignaturaHandler.GetByID).Methods("GET")
	r.HandleFunc("/api/asignaturas", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(asignaturaHandler.Create))).Methods("POST")
	r.HandleFunc("/api/asignaturas/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(asignaturaHandler.Update))).Methods("PUT")
	r.HandleFunc("/api/asignaturas/{id}", authMiddleware.Authenticate(authMiddleware.RequireRole(models.RolAdmin)(asignaturaHandler.Delete))).Methods("DELETE")

	r.HandleFunc("/api/proyectos-docentes", authMiddleware.Authenticate(pdHandler.GetAll)).Methods("GET")
	r.HandleFunc("/api/proyectos-docentes/{id}", authMiddleware.Authenticate(pdHandler.GetByID)).Methods("GET")
	r.HandleFunc("/api/proyectos-docentes", authMiddleware.Authenticate(pdHandler.Create)).Methods("POST")
	r.HandleFunc("/api/proyectos-docentes/{id}/enviar", authMiddleware.Authenticate(pdHandler.Enviar)).Methods("POST")
	r.HandleFunc("/api/proyectos-docentes/{id}/aprobar", authMiddleware.Authenticate(pdHandler.Aprobar)).Methods("POST")

	r.HandleFunc("/api/proyectos-docentes/{id}/formato", authMiddleware.Authenticate(formatoHandler.GetByProyectoDocenteID)).Methods("GET")
	r.HandleFunc("/api/proyectos-docentes/{id}/formato", authMiddleware.Authenticate(formatoHandler.CreateOrUpdate)).Methods("POST", "PUT")

	r.HandleFunc("/api/proyectos-docentes/{id}/contenido", authMiddleware.Authenticate(contenidoHandler.GetByProyectoDocenteID)).Methods("GET")
	r.HandleFunc("/api/proyectos-docentes/{id}/contenido", authMiddleware.Authenticate(contenidoHandler.Create)).Methods("POST")
	r.HandleFunc("/api/proyectos-docentes/{id}/contenido/{semana_id}", authMiddleware.Authenticate(contenidoHandler.Update)).Methods("PUT")
	r.HandleFunc("/api/proyectos-docentes/{id}/contenido/{semana_id}", authMiddleware.Authenticate(contenidoHandler.Delete)).Methods("DELETE")

	r.HandleFunc("/api/proyectos-docentes/{id}/bibliografia", authMiddleware.Authenticate(bibliografiaHandler.GetByProyectoDocenteID)).Methods("GET")
	r.HandleFunc("/api/proyectos-docentes/{id}/bibliografia", authMiddleware.Authenticate(bibliografiaHandler.Create)).Methods("POST")
	r.HandleFunc("/api/proyectos-docentes/{id}/bibliografia/{bib_id}", authMiddleware.Authenticate(bibliografiaHandler.Update)).Methods("PUT")
	r.HandleFunc("/api/proyectos-docentes/{id}/bibliografia/{bib_id}", authMiddleware.Authenticate(bibliografiaHandler.Delete)).Methods("DELETE")

	r.HandleFunc("/api/proyectos-docentes/{id}/seguimiento", authMiddleware.Authenticate(seguimientoHandler.GetByProyectoDocenteID)).Methods("GET")
	r.HandleFunc("/api/proyectos-docentes/{id}/seguimiento", authMiddleware.Authenticate(seguimientoHandler.Create)).Methods("POST")
	r.HandleFunc("/api/proyectos-docentes/{id}/seguimiento/{seg_id}", authMiddleware.Authenticate(seguimientoHandler.Update)).Methods("PUT")

	handler := corsMiddleware(r)

	log.Printf("Server starting on port %s...", serverPort)
	if err := http.ListenAndServe(":"+serverPort, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
