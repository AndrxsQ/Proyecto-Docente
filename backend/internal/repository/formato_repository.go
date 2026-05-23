package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type FormatoRepository struct {
	db *DB
}

func NewFormatoRepository(db *DB) *FormatoRepository {
	return &FormatoRepository{db: db}
}

func (r *FormatoRepository) GetByProyectoDocenteID(pdID int) (*models.Formato, error) {
	query := `
		SELECT id, proyecto_docente_id, descripcion, resultados_aprendizaje,
		       estrategias, evaluacion_resultados, tipo
		FROM formatos
		WHERE proyecto_docente_id = $1
	`
	row := r.db.QueryRow(query, pdID)

	var f models.Formato
	err := row.Scan(
		&f.ID, &f.ProyectoDocenteID, &f.Descripcion, &f.ResultadosAprendizaje,
		&f.Estrategias, &f.EvaluacionResultados, &f.Tipo,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &f, nil
}

func (r *FormatoRepository) Create(formato *models.Formato) error {
	query := `
		INSERT INTO formatos (proyecto_docente_id, descripcion, resultados_aprendizaje,
		                     estrategias, evaluacion_resultados, tipo)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
	`
	return r.db.QueryRow(query, formato.ProyectoDocenteID, formato.Descripcion,
		formato.ResultadosAprendizaje, formato.Estrategias,
		formato.EvaluacionResultados, formato.Tipo).Scan(&formato.ID)
}

func (r *FormatoRepository) Update(formato *models.Formato) error {
	query := `
		UPDATE formatos
		SET descripcion = $1, resultados_aprendizaje = $2, estrategias = $3,
		    evaluacion_resultados = $4, tipo = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(query, formato.Descripcion, formato.ResultadosAprendizaje,
		formato.Estrategias, formato.EvaluacionResultados, formato.Tipo, formato.ID)
	return err
}

func (r *FormatoRepository) Delete(id int) error {
	query := "DELETE FROM formatos WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
