package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type ProgramaHandler struct {
	programaService *service.ProgramaService
}

func NewProgramaHandler(programaService *service.ProgramaService) *ProgramaHandler {
	return &ProgramaHandler{programaService: programaService}
}

func (h *ProgramaHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get facultad_id from query parameters for filtering
	facultadIDStr := r.URL.Query().Get("facultad_id")
	var programas []models.ProgramaAcademico
	var err error

	if facultadIDStr != "" {
		facultadID, err := strconv.Atoi(facultadIDStr)
		if err != nil {
			http.Error(w, "Invalid facultad_id", http.StatusBadRequest)
			return
		}
		programas, err = h.programaService.GetByFacultad(facultadID)
	} else {
		programas, err = h.programaService.GetAll()
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(programas)
}

func (h *ProgramaHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/programas/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	programa, err := h.programaService.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(programa)
}

func (h *ProgramaHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var programa models.ProgramaAcademico
	if err := json.NewDecoder(r.Body).Decode(&programa); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.programaService.Create(&programa); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(programa)
}

func (h *ProgramaHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/programas/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var programa models.ProgramaAcademico
	if err := json.NewDecoder(r.Body).Decode(&programa); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	programa.ID = id
	if err := h.programaService.Update(&programa); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(programa)
}

func (h *ProgramaHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/programas/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.programaService.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Programa eliminado"})
}
