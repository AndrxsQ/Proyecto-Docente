package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type FacultadRepository struct {
	db *DB
}

func NewFacultadRepository(db *DB) *FacultadRepository {
	return &FacultadRepository{db: db}
}

func (r *FacultadRepository) GetAll() ([]models.Facultad, error) {
	query := "SELECT id, nombre FROM facultades ORDER BY nombre"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var facultades []models.Facultad
	for rows.Next() {
		var f models.Facultad
		if err := rows.Scan(&f.ID, &f.Nombre); err != nil {
			return nil, err
		}
		facultades = append(facultades, f)
	}

	return facultades, nil
}

func (r *FacultadRepository) GetByID(id int) (*models.Facultad, error) {
	query := "SELECT id, nombre FROM facultades WHERE id = $1"
	row := r.db.QueryRow(query, id)

	var f models.Facultad
	err := row.Scan(&f.ID, &f.Nombre)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &f, nil
}

func (r *FacultadRepository) Create(facultad *models.Facultad) error {
	query := "INSERT INTO facultades (nombre) VALUES ($1) RETURNING id"
	return r.db.QueryRow(query, facultad.Nombre).Scan(&facultad.ID)
}

func (r *FacultadRepository) Update(facultad *models.Facultad) error {
	query := "UPDATE facultades SET nombre = $1 WHERE id = $2"
	_, err := r.db.Exec(query, facultad.Nombre, facultad.ID)
	return err
}

func (r *FacultadRepository) Delete(id int) error {
	query := "DELETE FROM facultades WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
