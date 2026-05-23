package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type FormatoService struct {
	repo *repository.FormatoRepository
}

func NewFormatoService(repo *repository.FormatoRepository) *FormatoService {
	return &FormatoService{repo: repo}
}

func (s *FormatoService) GetByProyectoDocenteID(pdID int) (*models.Formato, error) {
	return s.repo.GetByProyectoDocenteID(pdID)
}

func (s *FormatoService) CreateOrUpdate(formato *models.Formato) error {
	existing, err := s.repo.GetByProyectoDocenteID(formato.ProyectoDocenteID)
	if err != nil {
		return err
	}

	if existing != nil {
		formato.ID = existing.ID
		return s.repo.Update(formato)
	}

	return s.repo.Create(formato)
}

func (s *FormatoService) Delete(id int) error {
	return s.repo.Delete(id)
}
