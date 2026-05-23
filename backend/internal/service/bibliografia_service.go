package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type BibliografiaService struct {
	repo *repository.BibliografiaRepository
}

func NewBibliografiaService(repo *repository.BibliografiaRepository) *BibliografiaService {
	return &BibliografiaService{repo: repo}
}

func (s *BibliografiaService) GetByProyectoDocenteID(pdID int) ([]models.Bibliografia, error) {
	return s.repo.GetByProyectoDocenteID(pdID)
}

func (s *BibliografiaService) Create(bibliografia *models.Bibliografia) error {
	return s.repo.Create(bibliografia)
}

func (s *BibliografiaService) Update(bibliografia *models.Bibliografia) error {
	return s.repo.Update(bibliografia)
}

func (s *BibliografiaService) Delete(id int) error {
	return s.repo.Delete(id)
}
