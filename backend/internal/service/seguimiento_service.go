package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type SeguimientoService struct {
	repo *repository.SeguimientoRepository
}

func NewSeguimientoService(repo *repository.SeguimientoRepository) *SeguimientoService {
	return &SeguimientoService{repo: repo}
}

func (s *SeguimientoService) GetByProyectoDocenteID(pdID int) ([]models.Seguimiento, error) {
	return s.repo.GetByProyectoDocenteID(pdID)
}

func (s *SeguimientoService) GetByAsignaturaID(asignaturaID int) ([]models.Seguimiento, error) {
	return s.repo.GetByAsignaturaID(asignaturaID)
}

func (s *SeguimientoService) GetByID(id int) (*models.Seguimiento, error) {
	return s.repo.GetByID(id)
}

func (s *SeguimientoService) Create(seguimiento *models.Seguimiento) error {
	return s.repo.Create(seguimiento)
}

func (s *SeguimientoService) Update(seguimiento *models.Seguimiento) error {
	return s.repo.Update(seguimiento)
}

func (s *SeguimientoService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *SeguimientoService) CalcularAvance(pdID int) (int, error) {
	seguimientos, err := s.repo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return 0, err
	}

	totalAvance := 0
	for _, seg := range seguimientos {
		if seg.Estado == models.EstadoSeguimientoCumplido {
			totalAvance += seg.PorcentajeAvance
		}
	}

	if totalAvance > 100 {
		totalAvance = 100
	}

	return totalAvance, nil
}
