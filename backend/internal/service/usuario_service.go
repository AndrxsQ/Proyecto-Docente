package service

import (
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
)

type UsuarioService struct {
	repo *repository.UsuarioRepository
	auth *AuthService
}

func NewUsuarioService(repo *repository.UsuarioRepository, auth *AuthService) *UsuarioService {
	return &UsuarioService{
		repo: repo,
		auth: auth,
	}
}

func (s *UsuarioService) GetAll() ([]models.Usuario, error) {
	return s.repo.GetAll()
}

func (s *UsuarioService) GetByID(id int) (*models.Usuario, error) {
	return s.repo.GetByID(id)
}

func (s *UsuarioService) GetByRol(rol models.Rol) ([]models.Usuario, error) {
	return s.repo.GetByRol(rol)
}

func (s *UsuarioService) Create(usuario *models.Usuario, password string) error {
	hash, err := s.auth.HashPassword(password)
	if err != nil {
		return err
	}
	return s.repo.Create(usuario, hash)
}

func (s *UsuarioService) Update(usuario *models.Usuario) error {
	return s.repo.Update(usuario)
}

func (s *UsuarioService) UpdatePassword(id int, password string) error {
	hash, err := s.auth.HashPassword(password)
	if err != nil {
		return err
	}
	return s.repo.UpdatePassword(id, hash)
}

func (s *UsuarioService) Delete(id int) error {
	return s.repo.Delete(id)
}
