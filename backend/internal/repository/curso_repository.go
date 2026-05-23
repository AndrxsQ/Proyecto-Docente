package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
)

type CursoRepository struct {
	db *DB
}

func NewCursoRepository(db *DB) *CursoRepository {
	return &CursoRepository{db: db}
}

func (r *CursoRepository) GetAll(filters map[string]interface{}) ([]models.Curso, error) {
	query := `
		SELECT c.id, c.nombre, c.componente, c.creditos, c.total_horas, c.tipo,
		       c.prerrequisitos, c.correquisitos, c.periodo_academico,
		       c.programa_id, c.docente_id,
		       p.nombre as programa_nombre, p.modalidad, p.jornada,
		       u.nombre as docente_nombre, u.apellido as docente_apellido
		FROM cursos c
		LEFT JOIN programas_academicos p ON c.programa_id = p.id
		LEFT JOIN usuarios u ON c.docente_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if programaID, ok := filters["programa_id"]; ok {
		query += " AND c.programa_id = $" + string(rune('0'+argIndex))
		args = append(args, programaID)
		argIndex++
	}

	if periodo, ok := filters["periodo"]; ok {
		query += " AND c.periodo_academico = $" + string(rune('0'+argIndex))
		args = append(args, periodo)
		argIndex++
	}

	if docenteID, ok := filters["docente_id"]; ok {
		query += " AND c.docente_id = $" + string(rune('0'+argIndex))
		args = append(args, docenteID)
		argIndex++
	}

	query += " ORDER BY c.nombre"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cursos []models.Curso
	for rows.Next() {
		var c models.Curso
		var programaNombre, programaModalidad, programaJornada sql.NullString
		var docenteNombre, docenteApellido sql.NullString
		if err := rows.Scan(
			&c.ID, &c.Nombre, &c.Componente, &c.Creditos, &c.TotalHoras, &c.Tipo,
			&c.Prerrequisitos, &c.Correquisitos, &c.PeriodoAcademico,
			&c.ProgramaID, &c.DocenteID,
			&programaNombre, &programaModalidad, &programaJornada,
			&docenteNombre, &docenteApellido,
		); err != nil {
			return nil, err
		}

		if programaNombre.Valid {
			c.Programa = &models.ProgramaAcademico{
				ID:        c.ProgramaID,
				Nombre:    programaNombre.String,
				Modalidad: models.Modalidad(programaModalidad.String),
				Jornada:   models.Jornada(programaJornada.String),
			}
		}

		if docenteNombre.Valid {
			c.Docente = &models.Usuario{
				ID:       c.DocenteID,
				Nombre:   docenteNombre.String,
				Apellido: docenteApellido.String,
			}
		}

		cursos = append(cursos, c)
	}

	return cursos, nil
}

func (r *CursoRepository) GetByID(id int) (*models.Curso, error) {
	query := `
		SELECT c.id, c.nombre, c.componente, c.creditos, c.total_horas, c.tipo,
		       c.prerrequisitos, c.correquisitos, c.periodo_academico,
		       c.programa_id, c.docente_id,
		       p.nombre as programa_nombre, p.modalidad, p.jornada,
		       u.nombre as docente_nombre, u.apellido as docente_apellido
		FROM cursos c
		LEFT JOIN programas_academicos p ON c.programa_id = p.id
		LEFT JOIN usuarios u ON c.docente_id = u.id
		WHERE c.id = $1
	`
	row := r.db.QueryRow(query, id)

	var c models.Curso
	var programaNombre, programaModalidad, programaJornada sql.NullString
	var docenteNombre, docenteApellido sql.NullString
	err := row.Scan(
		&c.ID, &c.Nombre, &c.Componente, &c.Creditos, &c.TotalHoras, &c.Tipo,
		&c.Prerrequisitos, &c.Correquisitos, &c.PeriodoAcademico,
		&c.ProgramaID, &c.DocenteID,
		&programaNombre, &programaModalidad, &programaJornada,
		&docenteNombre, &docenteApellido,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if programaNombre.Valid {
		c.Programa = &models.ProgramaAcademico{
			ID:        c.ProgramaID,
			Nombre:    programaNombre.String,
			Modalidad: models.Modalidad(programaModalidad.String),
			Jornada:   models.Jornada(programaJornada.String),
		}
	}

	if docenteNombre.Valid {
		c.Docente = &models.Usuario{
			ID:       c.DocenteID,
			Nombre:   docenteNombre.String,
			Apellido: docenteApellido.String,
		}
	}

	return &c, nil
}

func (r *CursoRepository) Create(curso *models.Curso) error {
	query := `
		INSERT INTO cursos (nombre, componente, creditos, total_horas, tipo, prerrequisitos, correquisitos, periodo_academico, programa_id, docente_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
	`
	return r.db.QueryRow(query, curso.Nombre, curso.Componente, curso.Creditos,
		curso.TotalHoras, curso.Tipo, curso.Prerrequisitos, curso.Correquisitos,
		curso.PeriodoAcademico, curso.ProgramaID, curso.DocenteID).Scan(&curso.ID)
}

func (r *CursoRepository) Update(curso *models.Curso) error {
	query := `
		UPDATE cursos
		SET nombre = $1, componente = $2, creditos = $3, total_horas = $4, tipo = $5,
		    prerrequisitos = $6, correquisitos = $7, periodo_academico = $8,
		    programa_id = $9, docente_id = $10
		WHERE id = $11
	`
	_, err := r.db.Exec(query, curso.Nombre, curso.Componente, curso.Creditos,
		curso.TotalHoras, curso.Tipo, curso.Prerrequisitos, curso.Correquisitos,
		curso.PeriodoAcademico, curso.ProgramaID, curso.DocenteID, curso.ID)
	return err
}

func (r *CursoRepository) Delete(id int) error {
	query := "DELETE FROM cursos WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}

func (r *CursoRepository) GetByDocente(docenteID int, periodo string) ([]models.Curso, error) {
	query := `
		SELECT c.id, c.nombre, c.componente, c.creditos, c.total_horas, c.tipo,
		       c.prerrequisitos, c.correquisitos, c.periodo_academico,
		       c.programa_id, c.docente_id,
		       p.nombre as programa_nombre, p.modalidad, p.jornada
		FROM cursos c
		LEFT JOIN programas_academicos p ON c.programa_id = p.id
		WHERE c.docente_id = $1 AND c.periodo_academico = $2
		ORDER BY c.nombre
	`
	rows, err := r.db.Query(query, docenteID, periodo)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cursos []models.Curso
	for rows.Next() {
		var c models.Curso
		var programaNombre, programaModalidad, programaJornada sql.NullString
		if err := rows.Scan(
			&c.ID, &c.Nombre, &c.Componente, &c.Creditos, &c.TotalHoras, &c.Tipo,
			&c.Prerrequisitos, &c.Correquisitos, &c.PeriodoAcademico,
			&c.ProgramaID, &c.DocenteID,
			&programaNombre, &programaModalidad, &programaJornada,
		); err != nil {
			return nil, err
		}

		if programaNombre.Valid {
			c.Programa = &models.ProgramaAcademico{
				ID:        c.ProgramaID,
				Nombre:    programaNombre.String,
				Modalidad: models.Modalidad(programaModalidad.String),
				Jornada:   models.Jornada(programaJornada.String),
			}
		}

		cursos = append(cursos, c)
	}

	return cursos, nil
}
