package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type ContenidoRepository struct {
	db *DB
}

func NewContenidoRepository(db *DB) *ContenidoRepository {
	return &ContenidoRepository{db: db}
}

func (r *ContenidoRepository) GetByProyectoDocenteID(pdID int) ([]models.ContenidoCurso, error) {
	query := `
		SELECT id, proyecto_docente_id, semana, tema, descripcion, observaciones
		FROM contenido_curso
		WHERE proyecto_docente_id = $1
		ORDER BY semana
	`
	rows, err := r.db.Query(query, pdID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contenidos []models.ContenidoCurso
	for rows.Next() {
		var c models.ContenidoCurso
		var observaciones sql.NullString
		if err := rows.Scan(
			&c.ID, &c.ProyectoDocenteID, &c.Semana, &c.Tema, &c.Descripcion,
			&observaciones,
		); err != nil {
			return nil, err
		}

		if observaciones.Valid {
			c.Observaciones = observaciones.String
		}

		contenidos = append(contenidos, c)
	}

	return contenidos, nil
}

func (r *ContenidoRepository) GetByID(id int) (*models.ContenidoCurso, error) {
	query := `
		SELECT id, proyecto_docente_id, semana, tema, descripcion, observaciones
		FROM contenido_curso
		WHERE id = $1
	`
	row := r.db.QueryRow(query, id)

	var c models.ContenidoCurso
	var observaciones sql.NullString
	err := row.Scan(
		&c.ID, &c.ProyectoDocenteID, &c.Semana, &c.Tema, &c.Descripcion,
		&observaciones,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if observaciones.Valid {
		c.Observaciones = observaciones.String
	}

	return &c, nil
}

func (r *ContenidoRepository) Create(contenido *models.ContenidoCurso) error {
	query := `
		INSERT INTO contenido_curso (proyecto_docente_id, semana, tema, descripcion, observaciones)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`
	return r.db.QueryRow(query, contenido.ProyectoDocenteID, contenido.Semana,
		contenido.Tema, contenido.Descripcion, contenido.Observaciones).Scan(&contenido.ID)
}

func (r *ContenidoRepository) Update(contenido *models.ContenidoCurso) error {
	query := `
		UPDATE contenido_curso
		SET semana = $1, tema = $2, descripcion = $3, observaciones = $4
		WHERE id = $5
	`
	_, err := r.db.Exec(query, contenido.Semana, contenido.Tema, contenido.Descripcion,
		contenido.Observaciones, contenido.ID)
	return err
}

func (r *ContenidoRepository) Delete(id int) error {
	query := "DELETE FROM contenido_curso WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
