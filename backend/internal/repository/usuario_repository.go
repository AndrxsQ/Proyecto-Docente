package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type UsuarioRepository struct {
	db *DB
}

func NewUsuarioRepository(db *DB) *UsuarioRepository {
	return &UsuarioRepository{db: db}
}

func (r *UsuarioRepository) GetAll() ([]models.Usuario, error) {
	query := `
		SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.programa_id, u.facultad_id,
		       p.nombre as programa_nombre, f.nombre as facultad_nombre
		FROM usuarios u
		LEFT JOIN programas_academicos p ON u.programa_id = p.id
		LEFT JOIN facultades f ON u.facultad_id = f.id
		ORDER BY u.nombre
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usuarios []models.Usuario
	for rows.Next() {
		var u models.Usuario
		var programaNombre, facultadNombre sql.NullString
		if err := rows.Scan(
			&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.Rol,
			&u.ProgramaID, &u.FacultadID, &programaNombre, &facultadNombre,
		); err != nil {
			return nil, err
		}

		if programaNombre.Valid && u.ProgramaID != nil {
			u.Programa = &models.ProgramaAcademico{ID: *u.ProgramaID, Nombre: programaNombre.String}
		}
		if facultadNombre.Valid && u.FacultadID != nil {
			u.Facultad = &models.Facultad{ID: *u.FacultadID, Nombre: facultadNombre.String}
		}

		usuarios = append(usuarios, u)
	}

	return usuarios, nil
}

func (r *UsuarioRepository) GetByID(id int) (*models.Usuario, error) {
	query := `
		SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.programa_id, u.facultad_id,
		       p.nombre as programa_nombre, f.nombre as facultad_nombre
		FROM usuarios u
		LEFT JOIN programas_academicos p ON u.programa_id = p.id
		LEFT JOIN facultades f ON u.facultad_id = f.id
		WHERE u.id = $1
	`
	row := r.db.QueryRow(query, id)

	var u models.Usuario
	var programaNombre, facultadNombre sql.NullString
	err := row.Scan(
		&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.Rol,
		&u.ProgramaID, &u.FacultadID, &programaNombre, &facultadNombre,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if programaNombre.Valid && u.ProgramaID != nil {
		u.Programa = &models.ProgramaAcademico{ID: *u.ProgramaID, Nombre: programaNombre.String}
	}
	if facultadNombre.Valid && u.FacultadID != nil {
		u.Facultad = &models.Facultad{ID: *u.FacultadID, Nombre: facultadNombre.String}
	}

	return &u, nil
}

func (r *UsuarioRepository) GetByRol(rol models.Rol) ([]models.Usuario, error) {
	query := `
		SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.programa_id, u.facultad_id,
		       p.nombre as programa_nombre, f.nombre as facultad_nombre
		FROM usuarios u
		LEFT JOIN programas_academicos p ON u.programa_id = p.id
		LEFT JOIN facultades f ON u.facultad_id = f.id
		WHERE u.rol = $1
		ORDER BY u.nombre
	`
	rows, err := r.db.Query(query, rol)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usuarios []models.Usuario
	for rows.Next() {
		var u models.Usuario
		var programaNombre, facultadNombre sql.NullString
		if err := rows.Scan(
			&u.ID, &u.Nombre, &u.Apellido, &u.Email, &u.Rol,
			&u.ProgramaID, &u.FacultadID, &programaNombre, &facultadNombre,
		); err != nil {
			return nil, err
		}

		if programaNombre.Valid && u.ProgramaID != nil {
			u.Programa = &models.ProgramaAcademico{ID: *u.ProgramaID, Nombre: programaNombre.String}
		}
		if facultadNombre.Valid && u.FacultadID != nil {
			u.Facultad = &models.Facultad{ID: *u.FacultadID, Nombre: facultadNombre.String}
		}

		usuarios = append(usuarios, u)
	}

	return usuarios, nil
}

func (r *UsuarioRepository) Create(usuario *models.Usuario, passwordHash string) error {
	query := `
		INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, programa_id, facultad_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
	`
	return r.db.QueryRow(query, usuario.Nombre, usuario.Apellido, usuario.Email,
		passwordHash, usuario.Rol, usuario.ProgramaID, usuario.FacultadID).Scan(&usuario.ID)
}

func (r *UsuarioRepository) Update(usuario *models.Usuario) error {
	query := `
		UPDATE usuarios
		SET nombre = $1, apellido = $2, email = $3, rol = $4, programa_id = $5, facultad_id = $6
		WHERE id = $7
	`
	_, err := r.db.Exec(query, usuario.Nombre, usuario.Apellido, usuario.Email,
		usuario.Rol, usuario.ProgramaID, usuario.FacultadID, usuario.ID)
	return err
}

func (r *UsuarioRepository) UpdatePassword(id int, passwordHash string) error {
	query := "UPDATE usuarios SET password_hash = $1 WHERE id = $2"
	_, err := r.db.Exec(query, passwordHash, id)
	return err
}

func (r *UsuarioRepository) Delete(id int) error {
	query := "DELETE FROM usuarios WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
