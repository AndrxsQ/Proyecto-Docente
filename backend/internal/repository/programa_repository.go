package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type ProgramaRepository struct {
	db *DB
}

func NewProgramaRepository(db *DB) *ProgramaRepository {
	return &ProgramaRepository{db: db}
}

func (r *ProgramaRepository) GetAll() ([]models.ProgramaAcademico, error) {
	query := `
		SELECT p.id, p.nombre, p.modalidad, p.jornada, p.plan_estudio, p.facultad_id, f.nombre
		FROM programas_academicos p
		LEFT JOIN facultades f ON p.facultad_id = f.id
		ORDER BY p.nombre
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var programas []models.ProgramaAcademico
	for rows.Next() {
		var p models.ProgramaAcademico
		var facultadNombre sql.NullString
		if err := rows.Scan(
			&p.ID, &p.Nombre, &p.Modalidad, &p.Jornada, &p.PlanEstudio,
			&p.FacultadID, &facultadNombre,
		); err != nil {
			return nil, err
		}
		if facultadNombre.Valid {
			p.Facultad = &models.Facultad{ID: p.FacultadID, Nombre: facultadNombre.String}
		}
		programas = append(programas, p)
	}

	return programas, nil
}

func (r *ProgramaRepository) GetByID(id int) (*models.ProgramaAcademico, error) {
	query := `
		SELECT p.id, p.nombre, p.modalidad, p.jornada, p.plan_estudio, p.facultad_id, f.nombre
		FROM programas_academicos p
		LEFT JOIN facultades f ON p.facultad_id = f.id
		WHERE p.id = $1
	`
	row := r.db.QueryRow(query, id)

	var p models.ProgramaAcademico
	var facultadNombre sql.NullString
	err := row.Scan(
		&p.ID, &p.Nombre, &p.Modalidad, &p.Jornada, &p.PlanEstudio,
		&p.FacultadID, &facultadNombre,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if facultadNombre.Valid {
		p.Facultad = &models.Facultad{ID: p.FacultadID, Nombre: facultadNombre.String}
	}

	return &p, nil
}

func (r *ProgramaRepository) GetByFacultad(facultadID int) ([]models.ProgramaAcademico, error) {
	query := `
		SELECT p.id, p.nombre, p.modalidad, p.jornada, p.plan_estudio, p.facultad_id, f.nombre
		FROM programas_academicos p
		LEFT JOIN facultades f ON p.facultad_id = f.id
		WHERE p.facultad_id = $1
		ORDER BY p.nombre
	`
	rows, err := r.db.Query(query, facultadID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var programas []models.ProgramaAcademico
	for rows.Next() {
		var p models.ProgramaAcademico
		var facultadNombre sql.NullString
		if err := rows.Scan(
			&p.ID, &p.Nombre, &p.Modalidad, &p.Jornada, &p.PlanEstudio,
			&p.FacultadID, &facultadNombre,
		); err != nil {
			return nil, err
		}
		if facultadNombre.Valid {
			p.Facultad = &models.Facultad{ID: p.FacultadID, Nombre: facultadNombre.String}
		}
		programas = append(programas, p)
	}

	return programas, nil
}

func (r *ProgramaRepository) Create(programa *models.ProgramaAcademico) error {
	query := `
		INSERT INTO programas_academicos (nombre, modalidad, jornada, plan_estudio, facultad_id)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`
	return r.db.QueryRow(query, programa.Nombre, programa.Modalidad, programa.Jornada,
		programa.PlanEstudio, programa.FacultadID).Scan(&programa.ID)
}

func (r *ProgramaRepository) Update(programa *models.ProgramaAcademico) error {
	query := `
		UPDATE programas_academicos
		SET nombre = $1, modalidad = $2, jornada = $3, plan_estudio = $4, facultad_id = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(query, programa.Nombre, programa.Modalidad, programa.Jornada,
		programa.PlanEstudio, programa.FacultadID, programa.ID)
	return err
}

func (r *ProgramaRepository) Delete(id int) error {
	query := "DELETE FROM programas_academicos WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
