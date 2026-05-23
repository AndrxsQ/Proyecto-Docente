package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type FormatoHandler struct {
	formatoService *service.FormatoService
}

func NewFormatoHandler(formatoService *service.FormatoService) *FormatoHandler {
	return &FormatoHandler{formatoService: formatoService}
}

func (h *FormatoHandler) GetByProyectoDocenteID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pdID, err := strconv.Atoi(r.URL.Query().Get("proyecto_docente_id"))
	if err != nil {
		http.Error(w, "Invalid proyecto_docente_id", http.StatusBadRequest)
		return
	}

	formato, err := h.formatoService.GetByProyectoDocenteID(pdID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(formato)
}

func (h *FormatoHandler) CreateOrUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var formato models.Formato
	if err := json.NewDecoder(r.Body).Decode(&formato); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.formatoService.CreateOrUpdate(&formato); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(formato)
}
