package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type ResultadoAprendizajeRepository struct {
	db *DB
}

func NewResultadoAprendizajeRepository(db *DB) *ResultadoAprendizajeRepository {
	return &ResultadoAprendizajeRepository{db: db}
}

func (r *ResultadoAprendizajeRepository) GetByProgramaID(programaID int) ([]models.ResultadoAprendizaje, error) {
	query := `
		SELECT ra.id, ra.programa_id, ra.codigo, ra.descripcion,
		       p.nombre as programa_nombre, p.modalidad, p.jornada
		FROM resultados_aprendizaje ra
		LEFT JOIN programas_academicos p ON ra.programa_id = p.id
		WHERE ra.programa_id = $1
		ORDER BY ra.codigo
	`
	rows, err := r.db.Query(query, programaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultados []models.ResultadoAprendizaje
	for rows.Next() {
		var ra models.ResultadoAprendizaje
		var programaNombre, programaModalidad, programaJornada sql.NullString
		if err := rows.Scan(
			&ra.ID, &ra.ProgramaID, &ra.Codigo, &ra.Descripcion,
			&programaNombre, &programaModalidad, &programaJornada,
		); err != nil {
			return nil, err
		}

		if programaNombre.Valid {
			ra.Programa = &models.ProgramaAcademico{
				ID:        ra.ProgramaID,
				Nombre:    programaNombre.String,
				Modalidad: models.Modalidad(programaModalidad.String),
				Jornada:   models.Jornada(programaJornada.String),
			}
		}

		resultados = append(resultados, ra)
	}

	return resultados, nil
}

func (r *ResultadoAprendizajeRepository) GetByAsignaturaID(asignaturaID int) ([]models.ResultadoAprendizaje, error) {
	query := `
		SELECT ra.id, ra.programa_id, ra.codigo, ra.descripcion,
		       p.nombre as programa_nombre, p.modalidad, p.jornada
		FROM resultados_aprendizaje ra
		INNER JOIN resultados_aprendizaje_asignatura raa ON ra.id = raa.resultado_aprendizaje_id
		LEFT JOIN programas_academicos p ON ra.programa_id = p.id
		WHERE raa.asignatura_id = $1
		ORDER BY ra.codigo
	`
	rows, err := r.db.Query(query, asignaturaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultados []models.ResultadoAprendizaje
	for rows.Next() {
		var ra models.ResultadoAprendizaje
		var programaNombre, programaModalidad, programaJornada sql.NullString
		if err := rows.Scan(
			&ra.ID, &ra.ProgramaID, &ra.Codigo, &ra.Descripcion,
			&programaNombre, &programaModalidad, &programaJornada,
		); err != nil {
			return nil, err
		}

		if programaNombre.Valid {
			ra.Programa = &models.ProgramaAcademico{
				ID:        ra.ProgramaID,
				Nombre:    programaNombre.String,
				Modalidad: models.Modalidad(programaModalidad.String),
				Jornada:   models.Jornada(programaJornada.String),
			}
		}

		resultados = append(resultados, ra)
	}

	return resultados, nil
}

func (r *ResultadoAprendizajeRepository) GetByID(id int) (*models.ResultadoAprendizaje, error) {
	query := `
		SELECT ra.id, ra.programa_id, ra.codigo, ra.descripcion,
		       p.nombre as programa_nombre, p.modalidad, p.jornada
		FROM resultados_aprendizaje ra
		LEFT JOIN programas_academicos p ON ra.programa_id = p.id
		WHERE ra.id = $1
	`
	row := r.db.QueryRow(query, id)

	var ra models.ResultadoAprendizaje
	var programaNombre, programaModalidad, programaJornada sql.NullString
	err := row.Scan(
		&ra.ID, &ra.ProgramaID, &ra.Codigo, &ra.Descripcion,
		&programaNombre, &programaModalidad, &programaJornada,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if programaNombre.Valid {
		ra.Programa = &models.ProgramaAcademico{
			ID:        ra.ProgramaID,
			Nombre:    programaNombre.String,
			Modalidad: models.Modalidad(programaModalidad.String),
			Jornada:   models.Jornada(programaJornada.String),
		}
	}

	return &ra, nil
}

func (r *ResultadoAprendizajeRepository) Create(resultado *models.ResultadoAprendizaje) error {
	query := `
		INSERT INTO resultados_aprendizaje (programa_id, codigo, descripcion)
		VALUES ($1, $2, $3) RETURNING id
	`
	return r.db.QueryRow(query, resultado.ProgramaID, resultado.Codigo, resultado.Descripcion).Scan(&resultado.ID)
}

func (r *ResultadoAprendizajeRepository) Update(resultado *models.ResultadoAprendizaje) error {
	query := `
		UPDATE resultados_aprendizaje
		SET programa_id = $1, codigo = $2, descripcion = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(query, resultado.ProgramaID, resultado.Codigo, resultado.Descripcion, resultado.ID)
	return err
}

func (r *ResultadoAprendizajeRepository) Delete(id int) error {
	query := "DELETE FROM resultados_aprendizaje WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
