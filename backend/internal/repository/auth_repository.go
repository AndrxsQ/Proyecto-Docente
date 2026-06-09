package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"

	"golang.org/x/crypto/bcrypt"
)

type AuthRepository struct {
	db *DB
}

func NewAuthRepository(db *DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func (r *AuthRepository) GetByEmail(email string) (*models.Usuario, error) {
	query := `
		SELECT id, nombre, apellido, email, password_hash, rol, programa_id, facultad_id
		FROM usuarios WHERE email = $1
	`
	row := r.db.QueryRow(query, email)

	var u models.Usuario
	err := row.Scan(
		&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.PasswordHash,
		&u.Rol, &u.ProgramaID, &u.FacultadID,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *AuthRepository) GetByID(id int) (*models.Usuario, error) {
	query := `
		SELECT id, nombre, apellido, email, password_hash, rol, programa_id, facultad_id
		FROM usuarios WHERE id = $1
	`
	row := r.db.QueryRow(query, id)

	var u models.Usuario
	err := row.Scan(
		&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.PasswordHash,
		&u.Rol, &u.ProgramaID, &u.FacultadID,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *AuthRepository) Create(req models.RegisterRequest) (*models.Usuario, error) {
	passwordHash, err := hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	query := `
		INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, programa_id, facultad_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, nombre, apellido, email, rol, programa_id, facultad_id
	`

	row := r.db.QueryRow(query, req.Nombre, req.Apellido, req.Email, passwordHash, req.Rol, req.ProgramaID, req.FacultadID)

	var u models.Usuario
	err = row.Scan(
		&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.Rol, &u.ProgramaID, &u.FacultadID,
	)
	if err != nil {
		return nil, err
	}

	return &u, nil
}
