package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type BibliografiaRepository struct {
	db *DB
}

func NewBibliografiaRepository(db *DB) *BibliografiaRepository {
	return &BibliografiaRepository{db: db}
}

func (r *BibliografiaRepository) GetByProyectoDocenteID(pdID int) ([]models.Bibliografia, error) {
	query := `
		SELECT id, proyecto_docente_id, referencia, tipo, url
		FROM bibliografia
		WHERE proyecto_docente_id = $1
		ORDER BY tipo, referencia
	`
	rows, err := r.db.Query(query, pdID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bibliografias []models.Bibliografia
	for rows.Next() {
		var b models.Bibliografia
		var url sql.NullString
		if err := rows.Scan(&b.ID, &b.ProyectoDocenteID, &b.Referencia, &b.Tipo, &url); err != nil {
			return nil, err
		}

		if url.Valid {
			b.URL = &url.String
		}

		bibliografias = append(bibliografias, b)
	}

	return bibliografias, nil
}

func (r *BibliografiaRepository) Create(bibliografia *models.Bibliografia) error {
	query := `
		INSERT INTO bibliografia (proyecto_docente_id, referencia, tipo, url)
		VALUES ($1, $2, $3, $4) RETURNING id
	`
	return r.db.QueryRow(query, bibliografia.ProyectoDocenteID, bibliografia.Referencia,
		bibliografia.Tipo, bibliografia.URL).Scan(&bibliografia.ID)
}

func (r *BibliografiaRepository) Update(bibliografia *models.Bibliografia) error {
	query := `
		UPDATE bibliografia
		SET referencia = $1, tipo = $2, url = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(query, bibliografia.Referencia, bibliografia.Tipo,
		bibliografia.URL, bibliografia.ID)
	return err
}

func (r *BibliografiaRepository) Delete(id int) error {
	query := "DELETE FROM bibliografia WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
