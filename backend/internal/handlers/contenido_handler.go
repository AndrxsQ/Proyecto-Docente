package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type ContenidoHandler struct {
	contenidoService *service.ContenidoService
}

func NewContenidoHandler(contenidoService *service.ContenidoService) *ContenidoHandler {
	return &ContenidoHandler{contenidoService: contenidoService}
}

func (h *ContenidoHandler) GetByProyectoDocenteID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pdID, err := strconv.Atoi(r.URL.Query().Get("proyecto_docente_id"))
	if err != nil {
		http.Error(w, "Invalid proyecto_docente_id", http.StatusBadRequest)
		return
	}

	contenido, err := h.contenidoService.GetByProyectoDocenteID(pdID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contenido)
}

func (h *ContenidoHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var contenido models.ContenidoCurso
	if err := json.NewDecoder(r.Body).Decode(&contenido); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.contenidoService.Create(&contenido); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contenido)
}

func (h *ContenidoHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 6 {
		http.Error(w, "Invalid URL path", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(pathParts[5])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var contenido models.ContenidoCurso
	if err := json.NewDecoder(r.Body).Decode(&contenido); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	contenido.ID = id
	if err := h.contenidoService.Update(&contenido); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contenido)
}

func (h *ContenidoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 6 {
		http.Error(w, "Invalid URL path", http.StatusBadRequest)
		return
	}
	id, err := strconv.Atoi(pathParts[5])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	if err := h.contenidoService.Delete(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Contenido eliminado"})
}
