package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type AsignaturaService struct {
	repo *repository.AsignaturaRepository
}

func NewAsignaturaService(repo *repository.AsignaturaRepository) *AsignaturaService {
	return &AsignaturaService{repo: repo}
}

func (s *AsignaturaService) GetAll(filters map[string]interface{}) ([]models.Asignatura, error) {
	return s.repo.GetAll(filters)
}

func (s *AsignaturaService) GetByID(id int) (*models.Asignatura, error) {
	return s.repo.GetByID(id)
}

func (s *AsignaturaService) Create(asignatura *models.Asignatura) error {
	return s.repo.Create(asignatura)
}

func (s *AsignaturaService) Update(asignatura *models.Asignatura) error {
	return s.repo.Update(asignatura)
}

func (s *AsignaturaService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *AsignaturaService) GetByDocente(docenteID int, periodo string) ([]models.Asignatura, error) {
	return s.repo.GetByDocente(docenteID, periodo)
}
