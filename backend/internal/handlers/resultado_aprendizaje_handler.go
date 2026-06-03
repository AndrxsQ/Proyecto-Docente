package handlers

import (
	"encoding/json"
	"net/http"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
	"strconv"
)

type ResultadoAprendizajeHandler struct {
	resultadoAprendizajeRepo *repository.ResultadoAprendizajeRepository
}

func NewResultadoAprendizajeHandler(resultadoAprendizajeRepo *repository.ResultadoAprendizajeRepository) *ResultadoAprendizajeHandler {
	return &ResultadoAprendizajeHandler{resultadoAprendizajeRepo: resultadoAprendizajeRepo}
}

func (h *ResultadoAprendizajeHandler) GetByPrograma(w http.ResponseWriter, r *http.Request) {
	programaIDStr := r.URL.Query().Get("programa_id")
	if programaIDStr == "" {
		http.Error(w, "programa_id is required", http.StatusBadRequest)
		return
	}

	programaID, err := strconv.Atoi(programaIDStr)
	if err != nil {
		http.Error(w, "Invalid programa_id", http.StatusBadRequest)
		return
	}

	resultados, err := h.resultadoAprendizajeRepo.GetByProgramaID(programaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultados)
}

func (h *ResultadoAprendizajeHandler) GetByAsignatura(w http.ResponseWriter, r *http.Request) {
	asignaturaIDStr := r.URL.Query().Get("asignatura_id")
	if asignaturaIDStr == "" {
		http.Error(w, "asignatura_id is required", http.StatusBadRequest)
		return
	}

	asignaturaID, err := strconv.Atoi(asignaturaIDStr)
	if err != nil {
		http.Error(w, "Invalid asignatura_id", http.StatusBadRequest)
		return
	}

	resultados, err := h.resultadoAprendizajeRepo.GetByAsignaturaID(asignaturaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultados)
}

func (h *ResultadoAprendizajeHandler) Create(w http.ResponseWriter, r *http.Request) {
	var resultado models.ResultadoAprendizaje
	if err := json.NewDecoder(r.Body).Decode(&resultado); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.resultadoAprendizajeRepo.Create(&resultado); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *ResultadoAprendizajeHandler) Update(w http.ResponseWriter, r *http.Request) {
	var resultado models.ResultadoAprendizaje
	if err := json.NewDecoder(r.Body).Decode(&resultado); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.resultadoAprendizajeRepo.Update(&resultado); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *ResultadoAprendizajeHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

	if err := h.resultadoAprendizajeRepo.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
