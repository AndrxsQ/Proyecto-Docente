package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type ProgramaService struct {
	repo *repository.ProgramaRepository
}

func NewProgramaService(repo *repository.ProgramaRepository) *ProgramaService {
	return &ProgramaService{repo: repo}
}

func (s *ProgramaService) GetAll() ([]models.ProgramaAcademico, error) {
	return s.repo.GetAll()
}

func (s *ProgramaService) GetByID(id int) (*models.ProgramaAcademico, error) {
	return s.repo.GetByID(id)
}

func (s *ProgramaService) GetByFacultad(facultadID int) ([]models.ProgramaAcademico, error) {
	return s.repo.GetByFacultad(facultadID)
}

func (s *ProgramaService) Create(programa *models.ProgramaAcademico) error {
	return s.repo.Create(programa)
}

func (s *ProgramaService) Update(programa *models.ProgramaAcademico) error {
	return s.repo.Update(programa)
}

func (s *ProgramaService) Delete(id int) error {
	return s.repo.Delete(id)
}
