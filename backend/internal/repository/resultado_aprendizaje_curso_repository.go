package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type ResultadoAprendizajeCursoRepository struct {
	db *DB
}

func NewResultadoAprendizajeCursoRepository(db *DB) *ResultadoAprendizajeCursoRepository {
	return &ResultadoAprendizajeCursoRepository{db: db}
}

func (r *ResultadoAprendizajeCursoRepository) GetByProyectoDocenteID(pdID int) ([]models.ResultadoAprendizajeCurso, error) {
	query := `
		SELECT rac.id, rac.proyecto_docente_id, rac.resultado_aprendizaje_id, rac.resultado_curso, rac.contribucion_programa,
		       ra.id as ra_id, ra.programa_id, ra.codigo, ra.descripcion
		FROM resultados_aprendizaje_curso rac
		LEFT JOIN resultados_aprendizaje ra ON rac.resultado_aprendizaje_id = ra.id
		WHERE rac.proyecto_docente_id = $1
		ORDER BY ra.codigo
	`
	rows, err := r.db.Query(query, pdID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultados []models.ResultadoAprendizajeCurso
	for rows.Next() {
		var rac models.ResultadoAprendizajeCurso
		var raID, raProgramaID sql.NullInt64
		var raCodigo, raDescripcion sql.NullString
		if err := rows.Scan(
			&rac.ID, &rac.ProyectoDocenteID, &rac.ResultadoAprendizajeID, &rac.ResultadoCurso, &rac.ContribucionPrograma,
			&raID, &raProgramaID, &raCodigo, &raDescripcion,
		); err != nil {
			return nil, err
		}

		if raID.Valid {
			rac.ResultadoAprendizaje = &models.ResultadoAprendizaje{
				ID:          int(raID.Int64),
				ProgramaID:  int(raProgramaID.Int64),
				Codigo:      raCodigo.String,
				Descripcion: raDescripcion.String,
			}
		}

		resultados = append(resultados, rac)
	}

	return resultados, nil
}

func (r *ResultadoAprendizajeCursoRepository) GetByID(id int) (*models.ResultadoAprendizajeCurso, error) {
	query := `
		SELECT rac.id, rac.proyecto_docente_id, rac.resultado_aprendizaje_id, rac.resultado_curso, rac.contribucion_programa,
		       ra.id as ra_id, ra.programa_id, ra.codigo, ra.descripcion
		FROM resultados_aprendizaje_curso rac
		LEFT JOIN resultados_aprendizaje ra ON rac.resultado_aprendizaje_id = ra.id
		WHERE rac.id = $1
	`
	row := r.db.QueryRow(query, id)

	var rac models.ResultadoAprendizajeCurso
	var raID, raProgramaID sql.NullInt64
	var raCodigo, raDescripcion sql.NullString
	err := row.Scan(
		&rac.ID, &rac.ProyectoDocenteID, &rac.ResultadoAprendizajeID, &rac.ResultadoCurso, &rac.ContribucionPrograma,
		&raID, &raProgramaID, &raCodigo, &raDescripcion,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if raID.Valid {
		rac.ResultadoAprendizaje = &models.ResultadoAprendizaje{
			ID:          int(raID.Int64),
			ProgramaID:  int(raProgramaID.Int64),
			Codigo:      raCodigo.String,
			Descripcion: raDescripcion.String,
		}
	}

	return &rac, nil
}

func (r *ResultadoAprendizajeCursoRepository) Create(resultado *models.ResultadoAprendizajeCurso) error {
	query := `
		INSERT INTO resultados_aprendizaje_curso (proyecto_docente_id, resultado_aprendizaje_id, resultado_curso, contribucion_programa)
		VALUES ($1, $2, $3, $4) RETURNING id
	`
	return r.db.QueryRow(query, resultado.ProyectoDocenteID, resultado.ResultadoAprendizajeID, resultado.ResultadoCurso, resultado.ContribucionPrograma).Scan(&resultado.ID)
}

func (r *ResultadoAprendizajeCursoRepository) Update(resultado *models.ResultadoAprendizajeCurso) error {
	query := `
		UPDATE resultados_aprendizaje_curso
		SET resultado_aprendizaje_id = $1, resultado_curso = $2, contribucion_programa = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(query, resultado.ResultadoAprendizajeID, resultado.ResultadoCurso, resultado.ContribucionPrograma, resultado.ID)
	return err
}

func (r *ResultadoAprendizajeCursoRepository) Delete(id int) error {
	query := "DELETE FROM resultados_aprendizaje_curso WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
