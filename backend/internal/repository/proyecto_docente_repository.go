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
		SELECT pd.id, pd.asignatura_id, pd.version, pd.estado, pd.creacion, pd.ultima_modificacion,
		       pd.docente_id, pd.sesiones_por_semana, pd.estado_jefedept, pd.estado_director, pd.estado_comite, pd.estado_decano,
		       c.nombre as asignatura_nombre, c.componente, c.creditos, c.periodo_academico,
		       u.nombre as docente_nombre, u.apellido as docente_apellido
		FROM proyectos_docente pd
		LEFT JOIN asignaturas c ON pd.asignatura_id = c.id
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

	if asignaturaID, ok := filters["asignatura_id"]; ok {
		query += " AND pd.asignatura_id = $" + string(rune('0'+argIndex))
		args = append(args, asignaturaID)
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
		var asignaturaNombre, componente, periodo string
		var creditos int
		var docenteNombre, docenteApellido sql.NullString
		if err := rows.Scan(
			&pd.ID, &pd.AsignaturaID, &pd.Version, &pd.Estado, &pd.Creacion, &pd.UltimaModificacion,
			&pd.DocenteID, &pd.SesionesPorSemana, &pd.EstadoJefeDept, &pd.EstadoDirector, &pd.EstadoComite, &pd.EstadoDecano,
			&asignaturaNombre, &componente, &creditos, &periodo,
			&docenteNombre, &docenteApellido,
		); err != nil {
			return nil, err
		}

		pd.Asignatura = &models.Asignatura{
			ID:               pd.AsignaturaID,
			Nombre:           asignaturaNombre,
			Componente:       componente,
			Creditos:         creditos,
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
		SELECT pd.id, pd.asignatura_id, pd.version, pd.estado, pd.creacion, pd.ultima_modificacion,
		       pd.docente_id, pd.sesiones_por_semana, pd.estado_jefedept, pd.estado_director, pd.estado_comite, pd.estado_decano,
		       c.id, c.nombre, c.componente, c.area, c.codigo, c.creditos, c.horas_ti, c.horas_tde, c.horas_tdp, c.total_horas, c.semanas, c.tipo,
		       c.prerrequisitos, c.correquisitos, c.periodo_academico, c.programa_id, c.docente_id,
		       p.id, p.nombre as programa_nombre, p.modalidad, p.jornada, p.facultad_id,
		       f.id, f.nombre as facultad_nombre,
		       u.id, u.nombre, u.apellido, u.email, u.rol
		FROM proyectos_docente pd
		LEFT JOIN asignaturas c ON pd.asignatura_id = c.id
		LEFT JOIN programas_academicos p ON c.programa_id = p.id
		LEFT JOIN facultades f ON p.facultad_id = f.id
		LEFT JOIN usuarios u ON pd.docente_id = u.id
		WHERE pd.id = $1
	`
	row := r.db.QueryRow(query, id)

	var pd models.ProyectoDocente
	var asignatura models.Asignatura
	var docente models.Usuario
	var programaID, programaFacultadID sql.NullInt64
	var programaNombre, programaModalidad, programaJornada sql.NullString
	var facultadID sql.NullInt64
	var facultadNombre sql.NullString
	err := row.Scan(
		&pd.ID, &pd.AsignaturaID, &pd.Version, &pd.Estado, &pd.Creacion, &pd.UltimaModificacion,
		&pd.DocenteID, &pd.SesionesPorSemana, &pd.EstadoJefeDept, &pd.EstadoDirector, &pd.EstadoComite, &pd.EstadoDecano,
		&asignatura.ID, &asignatura.Nombre, &asignatura.Componente, &asignatura.Area, &asignatura.Codigo, &asignatura.Creditos, &asignatura.HorasTI, &asignatura.HorasTDE, &asignatura.HorasTDP, &asignatura.TotalHoras, &asignatura.Semanas, &asignatura.Tipo,
		&asignatura.Prerrequisitos, &asignatura.Correquisitos, &asignatura.PeriodoAcademico, &asignatura.ProgramaID, &asignatura.DocenteID,
		&programaID, &programaNombre, &programaModalidad, &programaJornada, &programaFacultadID,
		&facultadID, &facultadNombre,
		&docente.ID, &docente.Nombre, &docente.Apellido, &docente.Email, &docente.Rol,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	pd.Asignatura = &asignatura
	pd.Docente = &docente

	if programaID.Valid {
		asignatura.Programa = &models.ProgramaAcademico{
			ID:         int(programaID.Int64),
			Nombre:     programaNombre.String,
			Modalidad:  models.Modalidad(programaModalidad.String),
			Jornada:    models.Jornada(programaJornada.String),
			FacultadID: int(programaFacultadID.Int64),
		}
		if facultadID.Valid {
			asignatura.Programa.Facultad = &models.Facultad{
				ID:     int(facultadID.Int64),
				Nombre: facultadNombre.String,
			}
		}
	}

	return &pd, nil
}

func (r *ProyectoDocenteRepository) Create(pd *models.ProyectoDocente) error {
	query := `
		INSERT INTO proyectos_docente (asignatura_id, version, estado, docente_id, sesiones_por_semana)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`
	return r.db.QueryRow(query, pd.AsignaturaID, pd.Version, pd.Estado, pd.DocenteID, pd.SesionesPorSemana).Scan(&pd.ID)
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

func (r *ProyectoDocenteRepository) GetNextVersion(asignaturaID int) (int, error) {
	query := "SELECT COALESCE(MAX(version), 0) FROM proyectos_docente WHERE asignatura_id = $1"
	var maxVersion int
	err := r.db.QueryRow(query, asignaturaID).Scan(&maxVersion)
	if err != nil {
		return 0, err
	}
	return maxVersion + 1, nil
}

func (r *ProyectoDocenteRepository) GetByAsignatura(asignaturaID int) ([]models.ProyectoDocente, error) {
	query := `
		SELECT id, asignatura_id, version, estado, creacion, ultima_modificacion, docente_id
		FROM proyectos_docente
		WHERE asignatura_id = $1
		ORDER BY version DESC
	`
	rows, err := r.db.Query(query, asignaturaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var proyectos []models.ProyectoDocente
	for rows.Next() {
		var pd models.ProyectoDocente
		if err := rows.Scan(
			&pd.ID, &pd.AsignaturaID, &pd.Version, &pd.Estado, &pd.Creacion, &pd.UltimaModificacion, &pd.DocenteID,
		); err != nil {
			return nil, err
		}
		proyectos = append(proyectos, pd)
	}

	return proyectos, nil
}
