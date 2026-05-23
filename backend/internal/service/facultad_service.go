package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type FacultadService struct {
	repo *repository.FacultadRepository
}

func NewFacultadService(repo *repository.FacultadRepository) *FacultadService {
	return &FacultadService{repo: repo}
}

func (s *FacultadService) GetAll() ([]models.Facultad, error) {
	return s.repo.GetAll()
}

func (s *FacultadService) GetByID(id int) (*models.Facultad, error) {
	return s.repo.GetByID(id)
}

func (s *FacultadService) Create(facultad *models.Facultad) error {
	return s.repo.Create(facultad)
}

func (s *FacultadService) Update(facultad *models.Facultad) error {
	return s.repo.Update(facultad)
}

func (s *FacultadService) Delete(id int) error {
	return s.repo.Delete(id)
}
