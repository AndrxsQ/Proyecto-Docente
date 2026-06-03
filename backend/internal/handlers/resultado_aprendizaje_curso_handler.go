package handlers

import (
	"encoding/json"
	"net/http"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
	"strconv"
)

type ResultadoAprendizajeCursoHandler struct {
	resultadoAprendizajeCursoRepo *repository.ResultadoAprendizajeCursoRepository
}

func NewResultadoAprendizajeCursoHandler(resultadoAprendizajeCursoRepo *repository.ResultadoAprendizajeCursoRepository) *ResultadoAprendizajeCursoHandler {
	return &ResultadoAprendizajeCursoHandler{resultadoAprendizajeCursoRepo: resultadoAprendizajeCursoRepo}
}

func (h *ResultadoAprendizajeCursoHandler) GetByProyectoDocente(w http.ResponseWriter, r *http.Request) {
	proyectoDocenteIDStr := r.URL.Query().Get("proyecto_docente_id")
	if proyectoDocenteIDStr == "" {
		http.Error(w, "proyecto_docente_id is required", http.StatusBadRequest)
		return
	}

	proyectoDocenteID, err := strconv.Atoi(proyectoDocenteIDStr)
	if err != nil {
		http.Error(w, "Invalid proyecto_docente_id", http.StatusBadRequest)
		return
	}

	resultados, err := h.resultadoAprendizajeCursoRepo.GetByProyectoDocenteID(proyectoDocenteID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultados)
}

func (h *ResultadoAprendizajeCursoHandler) Create(w http.ResponseWriter, r *http.Request) {
	var resultado models.ResultadoAprendizajeCurso
	if err := json.NewDecoder(r.Body).Decode(&resultado); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.resultadoAprendizajeCursoRepo.Create(&resultado); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *ResultadoAprendizajeCursoHandler) Update(w http.ResponseWriter, r *http.Request) {
	var resultado models.ResultadoAprendizajeCurso
	if err := json.NewDecoder(r.Body).Decode(&resultado); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.resultadoAprendizajeCursoRepo.Update(&resultado); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *ResultadoAprendizajeCursoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}

	if err := h.resultadoAprendizajeCursoRepo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
