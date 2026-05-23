package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type CursoHandler struct {
	cursoService *service.CursoService
}

func NewCursoHandler(cursoService *service.CursoService) *CursoHandler {
	return &CursoHandler{cursoService: cursoService}
}

func (h *CursoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	filters := make(map[string]interface{})
	if programaID := r.URL.Query().Get("programa_id"); programaID != "" {
		filters["programa_id"] = programaID
	}
	if periodo := r.URL.Query().Get("periodo"); periodo != "" {
		filters["periodo"] = periodo
	}
	if docenteID := r.URL.Query().Get("docente_id"); docenteID != "" {
		filters["docente_id"] = docenteID
	}

	cursos, err := h.cursoService.GetAll(filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cursos)
}

func (h *CursoHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/cursos/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	curso, err := h.cursoService.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(curso)
}

func (h *CursoHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var curso models.Curso
	if err := json.NewDecoder(r.Body).Decode(&curso); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.cursoService.Create(&curso); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(curso)
}

func (h *CursoHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/cursos/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var curso models.Curso
	if err := json.NewDecoder(r.Body).Decode(&curso); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	curso.ID = id
	if err := h.cursoService.Update(&curso); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(curso)
}
