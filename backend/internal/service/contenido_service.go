package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type ContenidoService struct {
	repo *repository.ContenidoRepository
}

func NewContenidoService(repo *repository.ContenidoRepository) *ContenidoService {
	return &ContenidoService{repo: repo}
}

func (s *ContenidoService) GetByProyectoDocenteID(pdID int) ([]models.ContenidoCurso, error) {
	return s.repo.GetByProyectoDocenteID(pdID)
}

func (s *ContenidoService) GetByID(id int) (*models.ContenidoCurso, error) {
	return s.repo.GetByID(id)
}

func (s *ContenidoService) Create(contenido *models.ContenidoCurso) error {
	return s.repo.Create(contenido)
}

func (s *ContenidoService) Update(contenido *models.ContenidoCurso) error {
	return s.repo.Update(contenido)
}

func (s *ContenidoService) Delete(id int) error {
	return s.repo.Delete(id)
}
