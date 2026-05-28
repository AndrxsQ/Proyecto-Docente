package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type SeguimientoRepository struct {
	db *DB
}

func NewSeguimientoRepository(db *DB) *SeguimientoRepository {
	return &SeguimientoRepository{db: db}
}

func (r *SeguimientoRepository) GetByProyectoDocenteID(pdID int) ([]models.Seguimiento, error) {
	query := `
		SELECT s.id, s.proyecto_docente_id, s.asignatura_id, s.docente_id, s.fecha,
		       s.desarrollo, s.descripcion, s.porcentaje_avance, s.estado, s.reporte, s.observaciones,
		       u.nombre as docente_nombre, u.apellido as docente_apellido
		FROM seguimiento s
		LEFT JOIN usuarios u ON s.docente_id = u.id
		WHERE s.proyecto_docente_id = $1
		ORDER BY s.fecha
	`
	rows, err := r.db.Query(query, pdID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var seguimientos []models.Seguimiento
	for rows.Next() {
		var s models.Seguimiento
		var reporte, observaciones sql.NullString
		var docenteNombre, docenteApellido sql.NullString
		if err := rows.Scan(
			&s.ID, &s.ProyectoDocenteID, &s.AsignaturaID, &s.DocenteID, &s.Fecha,
			&s.Desarrollo, &s.Descripcion, &s.PorcentajeAvance, &s.Estado, &reporte, &observaciones,
			&docenteNombre, &docenteApellido,
		); err != nil {
			return nil, err
		}

		if reporte.Valid {
			s.Reporte = reporte.String
		}
		if observaciones.Valid {
			s.Observaciones = observaciones.String
		}

		seguimientos = append(seguimientos, s)
	}

	return seguimientos, nil
}

func (r *SeguimientoRepository) GetByAsignaturaID(asignaturaID int) ([]models.Seguimiento, error) {
	query := `
		SELECT s.id, s.proyecto_docente_id, s.asignatura_id, s.docente_id, s.fecha,
		       s.desarrollo, s.descripcion, s.porcentaje_avance, s.estado, s.reporte, s.observaciones
		FROM seguimiento s
		WHERE s.asignatura_id = $1
		ORDER BY s.fecha
	`
	rows, err := r.db.Query(query, asignaturaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var seguimientos []models.Seguimiento
	for rows.Next() {
		var s models.Seguimiento
		var reporte, observaciones sql.NullString
		if err := rows.Scan(
			&s.ID, &s.ProyectoDocenteID, &s.AsignaturaID, &s.DocenteID, &s.Fecha,
			&s.Desarrollo, &s.Descripcion, &s.PorcentajeAvance, &s.Estado, &reporte, &observaciones,
		); err != nil {
			return nil, err
		}

		if reporte.Valid {
			s.Reporte = reporte.String
		}
		if observaciones.Valid {
			s.Observaciones = observaciones.String
		}

		seguimientos = append(seguimientos, s)
	}

	return seguimientos, nil
}

func (r *SeguimientoRepository) GetByID(id int) (*models.Seguimiento, error) {
	query := `
		SELECT id, proyecto_docente_id, asignatura_id, docente_id, fecha,
		       desarrollo, descripcion, porcentaje_avance, estado, reporte, observaciones
		FROM seguimiento
		WHERE id = $1
	`
	row := r.db.QueryRow(query, id)

	var s models.Seguimiento
	var reporte, observaciones sql.NullString
	err := row.Scan(
		&s.ID, &s.ProyectoDocenteID, &s.AsignaturaID, &s.DocenteID, &s.Fecha,
		&s.Desarrollo, &s.Descripcion, &s.PorcentajeAvance, &s.Estado, &reporte, &observaciones,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if reporte.Valid {
		s.Reporte = reporte.String
	}
	if observaciones.Valid {
		s.Observaciones = observaciones.String
	}

	return &s, nil
}

func (r *SeguimientoRepository) Create(seguimiento *models.Seguimiento) error {
	query := `
		INSERT INTO seguimiento (proyecto_docente_id, asignatura_id, docente_id, fecha, desarrollo,
		                         descripcion, porcentaje_avance, estado, reporte, observaciones)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
	`
	return r.db.QueryRow(query, seguimiento.ProyectoDocenteID, seguimiento.AsignaturaID,
		seguimiento.DocenteID, seguimiento.Fecha, seguimiento.Desarrollo,
		seguimiento.Descripcion, seguimiento.PorcentajeAvance, seguimiento.Estado,
		seguimiento.Reporte, seguimiento.Observaciones).Scan(&seguimiento.ID)
}

func (r *SeguimientoRepository) Update(seguimiento *models.Seguimiento) error {
	query := `
		UPDATE seguimiento
		SET fecha = $1, desarrollo = $2, descripcion = $3, porcentaje_avance = $4,
		    estado = $5, reporte = $6, observaciones = $7
		WHERE id = $8
	`
	_, err := r.db.Exec(query, seguimiento.Fecha, seguimiento.Desarrollo,
		seguimiento.Descripcion, seguimiento.PorcentajeAvance, seguimiento.Estado,
		seguimiento.Reporte, seguimiento.Observaciones, seguimiento.ID)
	return err
}

func (r *SeguimientoRepository) Delete(id int) error {
	query := "DELETE FROM seguimiento WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
