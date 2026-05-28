package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type AsignaturaHandler struct {
	asignaturaService *service.AsignaturaService
}

func NewAsignaturaHandler(asignaturaService *service.AsignaturaService) *AsignaturaHandler {
	return &AsignaturaHandler{asignaturaService: asignaturaService}
}

func (h *AsignaturaHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	log.Printf("GetAll called with method: %s", r.Method)
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
	log.Printf("Filters: %v", filters)

	asignaturas, err := h.asignaturaService.GetAll(filters)
	if err != nil {
		log.Printf("Error getting asignaturas: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Found %d asignaturas", len(asignaturas))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(asignaturas)
}

func (h *AsignaturaHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/asignaturas/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	asignatura, err := h.asignaturaService.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(asignatura)
}

func (h *AsignaturaHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var asignatura models.Asignatura
	if err := json.NewDecoder(r.Body).Decode(&asignatura); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.asignaturaService.Create(&asignatura); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(asignatura)
}

func (h *AsignaturaHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/asignaturas/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var asignatura models.Asignatura
	if err := json.NewDecoder(r.Body).Decode(&asignatura); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	asignatura.ID = id
	if err := h.asignaturaService.Update(&asignatura); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(asignatura)
}

func (h *AsignaturaHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/asignaturas/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.asignaturaService.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
