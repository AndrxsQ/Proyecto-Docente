package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type CursoService struct {
	repo *repository.CursoRepository
}

func NewCursoService(repo *repository.CursoRepository) *CursoService {
	return &CursoService{repo: repo}
}

func (s *CursoService) GetAll(filters map[string]interface{}) ([]models.Curso, error) {
	return s.repo.GetAll(filters)
}

func (s *CursoService) GetByID(id int) (*models.Curso, error) {
	return s.repo.GetByID(id)
}

func (s *CursoService) Create(curso *models.Curso) error {
	return s.repo.Create(curso)
}

func (s *CursoService) Update(curso *models.Curso) error {
	return s.repo.Update(curso)
}

func (s *CursoService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *CursoService) GetByDocente(docenteID int, periodo string) ([]models.Curso, error) {
	return s.repo.GetByDocente(docenteID, periodo)
}
