package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type BibliografiaHandler struct {
	bibliografiaService *service.BibliografiaService
}

func NewBibliografiaHandler(bibliografiaService *service.BibliografiaService) *BibliografiaHandler {
	return &BibliografiaHandler{bibliografiaService: bibliografiaService}
}

func (h *BibliografiaHandler) GetByProyectoDocenteID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pdID, err := strconv.Atoi(r.URL.Query().Get("proyecto_docente_id"))
	if err != nil {
		http.Error(w, "Invalid proyecto_docente_id", http.StatusBadRequest)
		return
	}

	bibliografia, err := h.bibliografiaService.GetByProyectoDocenteID(pdID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bibliografia)
}

func (h *BibliografiaHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var bibliografia models.Bibliografia
	if err := json.NewDecoder(r.Body).Decode(&bibliografia); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.bibliografiaService.Create(&bibliografia); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bibliografia)
}

func (h *BibliografiaHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var bibliografia models.Bibliografia
	if err := json.NewDecoder(r.Body).Decode(&bibliografia); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.bibliografiaService.Update(&bibliografia); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bibliografia)
}

func (h *BibliografiaHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.bibliografiaService.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Bibliografía eliminada"})
}
