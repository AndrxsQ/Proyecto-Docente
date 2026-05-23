package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type FacultadHandler struct {
	facultadService *service.FacultadService
}

func NewFacultadHandler(facultadService *service.FacultadService) *FacultadHandler {
	return &FacultadHandler{facultadService: facultadService}
}

func (h *FacultadHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	facultades, err := h.facultadService.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facultades)
}

func (h *FacultadHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var facultad models.Facultad
	if err := json.NewDecoder(r.Body).Decode(&facultad); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.facultadService.Create(&facultad); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facultad)
}

func (h *FacultadHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/facultades/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var facultad models.Facultad
	if err := json.NewDecoder(r.Body).Decode(&facultad); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	facultad.ID = id
	if err := h.facultadService.Update(&facultad); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(facultad)
}

func (h *FacultadHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/facultades/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.facultadService.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Facultad eliminada"})
}
