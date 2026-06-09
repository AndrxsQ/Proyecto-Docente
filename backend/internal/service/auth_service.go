package service

import (
	"errors"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	authRepo  *repository.AuthRepository
	secretKey string
}

func NewAuthService(authRepo *repository.AuthRepository, secretKey string) *AuthService {
	return &AuthService{
		authRepo:  authRepo,
		secretKey: secretKey,
	}
}

func (s *AuthService) Login(email, password string) (*models.LoginResponse, error) {
	usuario, err := s.authRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	if usuario == nil {
		return nil, errors.New("credenciales inválidas")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(usuario.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("credenciales inválidas")
	}

	token, err := s.generateToken(usuario)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token:   token,
		Usuario: *usuario,
	}, nil
}

func (s *AuthService) GetMe(userID int) (*models.Usuario, error) {
	return s.authRepo.GetByID(userID)
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.LoginResponse, error) {
	// Verificar si el email ya existe
	existingUser, err := s.authRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("el email ya está registrado")
	}

	// Crear el usuario
	usuario, err := s.authRepo.Create(req)
	if err != nil {
		return nil, err
	}

	// Generar token
	token, err := s.generateToken(usuario)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token:   token,
		Usuario: *usuario,
	}, nil
}

func (s *AuthService) generateToken(usuario *models.Usuario) (string, error) {
	claims := jwt.MapClaims{
		"user_id": usuario.ID,
		"rol":     usuario.Rol,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secretKey))
}

func (s *AuthService) ValidateToken(tokenString string) (int, models.Rol, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.secretKey), nil
	})

	if err != nil {
		return 0, "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := int(claims["user_id"].(float64))
		rol := models.Rol(claims["rol"].(string))
		return userID, rol, nil
	}

	return 0, "", errors.New("token inválido")
}

func (s *AuthService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}
