package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"proyecto-docente/internal/auth"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/service"
)

type ProyectoDocenteHandler struct {
	pdService *service.ProyectoDocenteService
}

func NewProyectoDocenteHandler(pdService *service.ProyectoDocenteService) *ProyectoDocenteHandler {
	return &ProyectoDocenteHandler{pdService: pdService}
}

func (h *ProyectoDocenteHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	filters := make(map[string]interface{})
	if estado := r.URL.Query().Get("estado"); estado != "" {
		filters["estado"] = estado
	}
	if asignaturaID := r.URL.Query().Get("asignatura_id"); asignaturaID != "" {
		filters["asignatura_id"] = asignaturaID
	}
	if docenteID := r.URL.Query().Get("docente_id"); docenteID != "" {
		filters["docente_id"] = docenteID
	}
	if periodo := r.URL.Query().Get("periodo"); periodo != "" {
		filters["periodo"] = periodo
	}

	proyectos, err := h.pdService.GetAll(filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(proyectos)
}

func (h *ProyectoDocenteHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/proyectos-docentes/"):])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	pd, err := h.pdService.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pd)
}

func (h *ProyectoDocenteHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		AsignaturaID      int `json:"asignatura_id"`
		DocenteID         int `json:"docente_id"`
		SesionesPorSemana int `json:"sesiones_por_semana"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	pd, err := h.pdService.Create(req.AsignaturaID, req.DocenteID, req.SesionesPorSemana)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pd)
}

func (h *ProyectoDocenteHandler) Enviar(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/proyectos-docentes/") : len(r.URL.Path)-len("/enviar")])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	fmt.Printf("DEBUG: Enviar - ID: %d\n", id)

	if err := h.pdService.Enviar(id); err != nil {
		fmt.Printf("DEBUG: Error in Enviar: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Proyecto enviado para revisión"})
}

func (h *ProyectoDocenteHandler) Aprobar(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id, err := strconv.Atoi(r.URL.Path[len("/api/proyectos-docentes/") : len(r.URL.Path)-len("/aprobar")])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req models.AprobarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userRol := auth.GetUserRol(r)
	userID := auth.GetUserID(r)

	fmt.Printf("DEBUG: Aprobar - ID: %d, Rol: %s, UserID: %d\n", id, userRol, userID)

	if err := h.pdService.Aprobar(id, userRol, userID, req.Observacion); err != nil {
		fmt.Printf("DEBUG: Error in Aprobar: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Proyecto aprobado"})
}
