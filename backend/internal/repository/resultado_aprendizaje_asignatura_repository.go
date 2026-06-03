package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type ResultadoAprendizajeAsignaturaRepository struct {
	db *DB
}

func NewResultadoAprendizajeAsignaturaRepository(db *DB) *ResultadoAprendizajeAsignaturaRepository {
	return &ResultadoAprendizajeAsignaturaRepository{db: db}
}

func (r *ResultadoAprendizajeAsignaturaRepository) GetByAsignaturaID(asignaturaID int) ([]models.ResultadoAprendizajeAsignatura, error) {
	query := `
		SELECT raa.id, raa.resultado_aprendizaje_id, raa.asignatura_id,
		       ra.id as ra_id, ra.programa_id, ra.codigo, ra.descripcion,
		       a.id as asignatura_id, a.nombre as asignatura_nombre
		FROM resultados_aprendizaje_asignatura raa
		INNER JOIN resultados_aprendizaje ra ON raa.resultado_aprendizaje_id = ra.id
		INNER JOIN asignaturas a ON raa.asignatura_id = a.id
		WHERE raa.asignatura_id = $1
		ORDER BY ra.codigo
	`
	rows, err := r.db.Query(query, asignaturaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var relaciones []models.ResultadoAprendizajeAsignatura
	for rows.Next() {
		var raa models.ResultadoAprendizajeAsignatura
		var ra models.ResultadoAprendizaje
		var asignaturaNombre sql.NullString
		if err := rows.Scan(
			&raa.ID, &raa.ResultadoAprendizajeID, &raa.AsignaturaID,
			&ra.ID, &ra.ProgramaID, &ra.Codigo, &ra.Descripcion,
			&asignaturaNombre,
		); err != nil {
			return nil, err
		}

		raa.ResultadoAprendizaje = &ra
		if asignaturaNombre.Valid {
			raa.Asignatura = &models.Asignatura{
				ID:     raa.AsignaturaID,
				Nombre: asignaturaNombre.String,
			}
		}

		relaciones = append(relaciones, raa)
	}

	return relaciones, nil
}

func (r *ResultadoAprendizajeAsignaturaRepository) Create(relacion *models.ResultadoAprendizajeAsignatura) error {
	query := `
		INSERT INTO resultados_aprendizaje_asignatura (resultado_aprendizaje_id, asignatura_id)
		VALUES ($1, $2) RETURNING id
	`
	return r.db.QueryRow(query, relacion.ResultadoAprendizajeID, relacion.AsignaturaID).Scan(&relacion.ID)
}

func (r *ResultadoAprendizajeAsignaturaRepository) DeleteByAsignaturaID(asignaturaID int) error {
	query := "DELETE FROM resultados_aprendizaje_asignatura WHERE asignatura_id = $1"
	_, err := r.db.Exec(query, asignaturaID)
	return err
}

func (r *ResultadoAprendizajeAsignaturaRepository) Delete(resultadoAprendizajeID, asignaturaID int) error {
	query := "DELETE FROM resultados_aprendizaje_asignatura WHERE resultado_aprendizaje_id = $1 AND asignatura_id = $2"
	_, err := r.db.Exec(query, resultadoAprendizajeID, asignaturaID)
	return err
}
