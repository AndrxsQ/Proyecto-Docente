package repository

import (
	"proyecto-docente/internal/models"
)

type ObservacionRepository struct {
	db *DB
}

func NewObservacionRepository(db *DB) *ObservacionRepository {
	return &ObservacionRepository{db: db}
}

func (r *ObservacionRepository) GetByProyectoDocenteID(pdID int) ([]models.Observacion, error) {
	query := `
		SELECT o.id, o.proyecto_docente_id, o.autor_id, o.tipo, o.descripcion, o.fecha,
		       u.nombre as autor_nombre, u.apellido as autor_apellido, u.rol
		FROM observaciones o
		LEFT JOIN usuarios u ON o.autor_id = u.id
		WHERE o.proyecto_docente_id = $1
		ORDER BY o.fecha DESC
	`
	rows, err := r.db.Query(query, pdID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var observaciones []models.Observacion
	for rows.Next() {
		var o models.Observacion
		if err := rows.Scan(
			&o.ID, &o.ProyectoDocenteID, &o.AutorID, &o.Tipo, &o.Descripcion, &o.Fecha,
			&o.Autor.Nombre, &o.Autor.Apellido, &o.Autor.Rol,
		); err != nil {
			return nil, err
		}

		o.Autor.ID = o.AutorID
		observaciones = append(observaciones, o)
	}

	return observaciones, nil
}

func (r *ObservacionRepository) Create(observacion *models.Observacion) error {
	query := `
		INSERT INTO observaciones (proyecto_docente_id, autor_id, tipo, descripcion)
		VALUES ($1, $2, $3, $4) RETURNING id
	`
	return r.db.QueryRow(query, observacion.ProyectoDocenteID, observacion.AutorID,
		observacion.Tipo, observacion.Descripcion).Scan(&observacion.ID)
}

func (r *ObservacionRepository) Delete(id int) error {
	query := "DELETE FROM observaciones WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
