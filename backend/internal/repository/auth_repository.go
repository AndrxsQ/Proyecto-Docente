package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type AuthRepository struct {
	db *DB
}

func NewAuthRepository(db *DB) *AuthRepository {
	return &AuthRepository{db: db}
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
