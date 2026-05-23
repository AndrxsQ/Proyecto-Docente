package repository

import (
	"database/sql"
	"proyecto-docente/internal/models"
	"time"
)

type ProyectoDocenteRepository struct {
	db *DB
}

func NewProyectoDocenteRepository(db *DB) *ProyectoDocenteRepository {
	return &ProyectoDocenteRepository{db: db}
}

func (r *ProyectoDocenteRepository) GetAll(filters map[string]interface{}) ([]models.ProyectoDocente, error) {
	query := `
		SELECT pd.id, pd.curso_id, pd.version, pd.estado, pd.creacion, pd.ultima_modificacion,
		       pd.docente_id, pd.estado_jefedept, pd.estado_director, pd.estado_comite, pd.estado_decano,
		       c.nombre as curso_nombre, c.componente, c.creditos, c.periodo_academico,
		       u.nombre as docente_nombre, u.apellido as docente_apellido
		FROM proyectos_docente pd
		LEFT JOIN cursos c ON pd.curso_id = c.id
		LEFT JOIN usuarios u ON pd.docente_id = u.id
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	if estado, ok := filters["estado"]; ok {
		query += " AND pd.estado = $" + string(rune('0'+argIndex))
		args = append(args, estado)
		argIndex++
	}

	if cursoID, ok := filters["curso_id"]; ok {
		query += " AND pd.curso_id = $" + string(rune('0'+argIndex))
		args = append(args, cursoID)
		argIndex++
	}

	if docenteID, ok := filters["docente_id"]; ok {
		query += " AND pd.docente_id = $" + string(rune('0'+argIndex))
		args = append(args, docenteID)
		argIndex++
	}

	if periodo, ok := filters["periodo"]; ok {
		query += " AND c.periodo_academico = $" + string(rune('0'+argIndex))
		args = append(args, periodo)
		argIndex++
	}

	query += " ORDER BY pd.ultima_modificacion DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var proyectos []models.ProyectoDocente
	for rows.Next() {
		var pd models.ProyectoDocente
		var cursoNombre, componente, periodo string
		var creditos int
		var docenteNombre, docenteApellido sql.NullString
		if err := rows.Scan(
			&pd.ID, &pd.CursoID, &pd.Version, &pd.Estado, &pd.Creacion, &pd.UltimaModificacion,
			&pd.DocenteID, &pd.EstadoJefeDept, &pd.EstadoDirector, &pd.EstadoComite, &pd.EstadoDecano,
			&cursoNombre, &componente, &creditos, &periodo,
			&docenteNombre, &docenteApellido,
		); err != nil {
			return nil, err
		}

		pd.Curso = &models.Curso{
			ID:              pd.CursoID,
			Nombre:          cursoNombre,
			Componente:      componente,
			Creditos:        creditos,
			PeriodoAcademico: periodo,
		}

		if docenteNombre.Valid {
			pd.Docente = &models.Usuario{
				ID:       pd.DocenteID,
				Nombre:   docenteNombre.String,
				Apellido: docenteApellido.String,
			}
		}

		proyectos = append(proyectos, pd)
	}

	return proyectos, nil
}

func (r *ProyectoDocenteRepository) GetByID(id int) (*models.ProyectoDocente, error) {
	query := `
		SELECT pd.id, pd.curso_id, pd.version, pd.estado, pd.creacion, pd.ultima_modificacion,
		       pd.docente_id, pd.estado_jefedept, pd.estado_director, pd.estado_comite, pd.estado_decano,
		       c.id, c.nombre, c.componente, c.creditos, c.total_horas, c.tipo,
		       c.prerrequisitos, c.correquisitos, c.periodo_academico, c.programa_id, c.docente_id,
		       u.id, u.nombre, u.apellido, u.email, u.rol
		FROM proyectos_docente pd
		LEFT JOIN cursos c ON pd.curso_id = c.id
		LEFT JOIN usuarios u ON pd.docente_id = u.id
		WHERE pd.id = $1
	`
	row := r.db.QueryRow(query, id)

	var pd models.ProyectoDocente
	var curso models.Curso
	var docente models.Usuario
	err := row.Scan(
		&pd.ID, &pd.CursoID, &pd.Version, &pd.Estado, &pd.Creacion, &pd.UltimaModificacion,
		&pd.DocenteID, &pd.EstadoJefeDept, &pd.EstadoDirector, &pd.EstadoComite, &pd.EstadoDecano,
		&curso.ID, &curso.Nombre, &curso.Componente, &curso.Creditos, &curso.TotalHoras, &curso.Tipo,
		&curso.Prerrequisitos, &curso.Correquisitos, &curso.PeriodoAcademico, &curso.ProgramaID, &curso.DocenteID,
		&docente.ID, &docente.Nombre, &docente.Apellido, &docente.Email, &docente.Rol,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	pd.Curso = &curso
	pd.Docente = &docente

	return &pd, nil
}

func (r *ProyectoDocenteRepository) Create(pd *models.ProyectoDocente) error {
	query := `
		INSERT INTO proyectos_docente (curso_id, version, estado, docente_id)
		VALUES ($1, $2, $3, $4) RETURNING id
	`
	return r.db.QueryRow(query, pd.CursoID, pd.Version, pd.Estado, pd.DocenteID).Scan(&pd.ID)
}

func (r *ProyectoDocenteRepository) Update(pd *models.ProyectoDocente) error {
	query := `
		UPDATE proyectos_docente
		SET estado = $1, ultima_modificacion = $2,
		    estado_jefedept = $3, estado_director = $4, estado_comite = $5, estado_decano = $6
		WHERE id = $7
	`
	_, err := r.db.Exec(query, pd.Estado, time.Now(), pd.EstadoJefeDept, pd.EstadoDirector,
		pd.EstadoComite, pd.EstadoDecano, pd.ID)
	return err
}

func (r *ProyectoDocenteRepository) GetNextVersion(cursoID int) (int, error) {
	query := "SELECT COALESCE(MAX(version), 0) FROM proyectos_docente WHERE curso_id = $1"
	var maxVersion int
	err := r.db.QueryRow(query, cursoID).Scan(&maxVersion)
	if err != nil {
		return 0, err
	}
	return maxVersion + 1, nil
}

func (r *ProyectoDocenteRepository) GetByCurso(cursoID int) ([]models.ProyectoDocente, error) {
	query := `
		SELECT id, curso_id, version, estado, creacion, ultima_modificacion, docente_id
		FROM proyectos_docente
		WHERE curso_id = $1
		ORDER BY version DESC
	`
	rows, err := r.db.Query(query, cursoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var proyectos []models.ProyectoDocente
	for rows.Next() {
		var pd models.ProyectoDocente
		if err := rows.Scan(
			&pd.ID, &pd.CursoID, &pd.Version, &pd.Estado, &pd.Creacion, &pd.UltimaModificacion, &pd.DocenteID,
		); err != nil {
			return nil, err
		}
		proyectos = append(proyectos, pd)
	}

	return proyectos, nil
}
