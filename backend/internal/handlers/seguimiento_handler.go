package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type SeguimientoHandler struct {
	seguimientoService *service.SeguimientoService
}

func NewSeguimientoHandler(seguimientoService *service.SeguimientoService) *SeguimientoHandler {
	return &SeguimientoHandler{seguimientoService: seguimientoService}
}

func (h *SeguimientoHandler) GetByProyectoDocenteID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pdID, err := strconv.Atoi(r.URL.Query().Get("proyecto_docente_id"))
	if err != nil {
		http.Error(w, "Invalid proyecto_docente_id", http.StatusBadRequest)
		return
	}

	seguimiento, err := h.seguimientoService.GetByProyectoDocenteID(pdID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(seguimiento)
}

func (h *SeguimientoHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var seguimiento models.Seguimiento
	if err := json.NewDecoder(r.Body).Decode(&seguimiento); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.seguimientoService.Create(&seguimiento); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(seguimiento)
}

func (h *SeguimientoHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/proyectos-docentes/"):len(r.URL.Path)-len("/seguimiento/")])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var seguimiento models.Seguimiento
	if err := json.NewDecoder(r.Body).Decode(&seguimiento); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	seguimiento.ID = id
	if err := h.seguimientoService.Update(&seguimiento); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(seguimiento)
}
