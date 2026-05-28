package models

import "time"

type Rol string

const (
	RolDocente                  Rol = "DOCENTE"
	RolJefeDepartamento         Rol = "JEFE_DEPARTAMENTO"
	RolDirectorPrograma         Rol = "DIRECTOR_PROGRAMA"
	RolCoordinadorPrograma      Rol = "COORDINADOR_PROGRAMA"
	RolComiteCurricular         Rol = "COMITE_CURRICULAR"
	RolComiteAcademicoInstituto Rol = "COMITE_ACADEMICO_INSTITUTO"
	RolDecano                   Rol = "DECANO"
	RolEstudiante               Rol = "ESTUDIANTE"
	RolAdmin                    Rol = "ADMIN"
)

type GrupoPermiso string

const (
	GrupoDocente         GrupoPermiso = "DOCENTE"
	GrupoRevision        GrupoPermiso = "REVISION"
	GrupoComite          GrupoPermiso = "COMITE"
	GrupoAprobacionFinal GrupoPermiso = "APROBACION_FINAL"
)

func (r Rol) GetGrupo() GrupoPermiso {
	switch r {
	case RolDocente:
		return GrupoDocente
	case RolJefeDepartamento, RolDirectorPrograma, RolCoordinadorPrograma:
		return GrupoRevision
	case RolComiteCurricular, RolComiteAcademicoInstituto:
		return GrupoComite
	case RolDecano:
		return GrupoAprobacionFinal
	default:
		return ""
	}
}

type EstadoPD string

const (
	EstadoElaborado  EstadoPD = "ELABORADO"
	EstadoEnRevision EstadoPD = "EN_REVISION"
	EstadoRevisado   EstadoPD = "REVISADO"
	EstadoAvalado    EstadoPD = "AVALADO"
	EstadoAprobado   EstadoPD = "APROBADO"
)

type EstadoRevision string

const (
	EstadoRevisionPendiente EstadoRevision = "PENDIENTE"
	EstadoRevisionAprobado  EstadoRevision = "APROBADO"
	EstadoRevisionDevuelto  EstadoRevision = "DEVUELTO"
)

type TipoBibliografia string

const (
	TipoBibliografiaBasica         TipoBibliografia = "BASICA"
	TipoBibliografiaComplementaria TipoBibliografia = "COMPLEMENTARIA"
)

type TipoObservacion string

const (
	TipoObservacionDevolucion TipoObservacion = "DEVOLUCION"
	TipoObservacionComentario TipoObservacion = "COMENTARIO"
	TipoObservacionAprobacion TipoObservacion = "APROBACION"
)

type EstadoSeguimiento string

const (
	EstadoSeguimientoCumplido     EstadoSeguimiento = "CUMPLIDO"
	EstadoSeguimientoPendiente    EstadoSeguimiento = "PENDIENTE"
	EstadoSeguimientoReprogramado EstadoSeguimiento = "REPROGRAMADO"
)

type Modalidad string

const (
	ModalidadPresencial Modalidad = "presencial"
	ModalidadVirtual    Modalidad = "virtual"
	ModalidadMixta      Modalidad = "mixta"
)

type Jornada string

const (
	JornadaDiurna   Jornada = "diurna"
	JornadaNocturna Jornada = "nocturna"
)

type TipoAsignatura string

const (
	TipoAsignaturaObligatorio TipoAsignatura = "obligatorio"
	TipoAsignaturaOpcional    TipoAsignatura = "opcional"
)

type Facultad struct {
	ID     int    `json:"id"`
	Nombre string `json:"nombre"`
}

type ProgramaAcademico struct {
	ID          int       `json:"id"`
	Nombre      string    `json:"nombre"`
	Modalidad   Modalidad `json:"modalidad"`
	Jornada     Jornada   `json:"jornada"`
	PlanEstudio int       `json:"planDeEstudio"`
	FacultadID  int       `json:"facultad_id"`
	Facultad    *Facultad `json:"facultad,omitempty"`
}

type Asignatura struct {
	ID               int                `json:"id"`
	Nombre           string             `json:"nombre"`
	Componente       string             `json:"componente"`
	Area             string             `json:"area"`
	Codigo           string             `json:"codigo"`
	Creditos         int                `json:"creditos"`
	HorasTI          int                `json:"horas_ti"`
	HorasTDE         int                `json:"horas_tde"`
	HorasTDP         int                `json:"horas_tdp"`
	TotalHoras       int                `json:"total_horas"`
	Tipo             TipoAsignatura     `json:"tipo"`
	Prerrequisitos   *string            `json:"prerrequisitos"`
	Correquisitos    *string            `json:"correquisitos"`
	PeriodoAcademico string             `json:"periodo_academico"`
	ProgramaID       int                `json:"programa_id"`
	DocenteID        int                `json:"docente_id"`
	Programa         *ProgramaAcademico `json:"programa,omitempty"`
	Docente          *Usuario           `json:"docente,omitempty"`
}

type Usuario struct {
	ID           int                `json:"id"`
	Nombre       string             `json:"nombre"`
	Apellido     string             `json:"apellido"`
	Email        string             `json:"email"`
	PasswordHash string             `json:"-"`
	Rol          Rol                `json:"rol"`
	ProgramaID   *int               `json:"programa_id,omitempty"`
	FacultadID   *int               `json:"facultad_id,omitempty"`
	Programa     *ProgramaAcademico `json:"programa,omitempty"`
	Facultad     *Facultad          `json:"facultad,omitempty"`
}

type ProyectoDocente struct {
	ID                 int              `json:"id"`
	AsignaturaID       int              `json:"asignatura_id"`
	Version            int              `json:"version"`
	Estado             EstadoPD         `json:"estado"`
	Creacion           time.Time        `json:"creacion"`
	UltimaModificacion time.Time        `json:"ultima_modificacion"`
	DocenteID          int              `json:"docente_id"`
	EstadoJefeDept     EstadoRevision   `json:"estado_jefedept"`
	EstadoDirector     EstadoRevision   `json:"estado_director"`
	EstadoComite       EstadoRevision   `json:"estado_comite"`
	EstadoDecano       EstadoRevision   `json:"estado_decano"`
	Asignatura         *Asignatura      `json:"asignatura,omitempty"`
	Docente            *Usuario         `json:"docente,omitempty"`
	Formato            *Formato         `json:"formato,omitempty"`
	Contenido          []ContenidoCurso `json:"contenido,omitempty"`
	Bibliografia       []Bibliografia   `json:"bibliografia,omitempty"`
	Seguimiento        []Seguimiento    `json:"seguimiento,omitempty"`
	Observaciones      []Observacion    `json:"observaciones,omitempty"`
}

type Formato struct {
	ID                    int    `json:"id"`
	ProyectoDocenteID     int    `json:"proyecto_docente_id"`
	Descripcion           string `json:"descripcion"`
	ResultadosAprendizaje string `json:"resultados_aprendizaje"`
	Estrategias           string `json:"estrategias"`
	EvaluacionResultados  string `json:"evaluacion_resultados"`
	Tipo                  string `json:"tipo"`
}

type ContenidoCurso struct {
	ID                int     `json:"id"`
	ProyectoDocenteID int     `json:"proyecto_docente_id"`
	Semana            int     `json:"semana"`
	Tema              string  `json:"tema"`
	Descripcion       string  `json:"descripcion"`
	Fecha             *string `json:"fecha"`
	Observaciones     string  `json:"observaciones,omitempty"`
}

type Seguimiento struct {
	ID                int               `json:"id"`
	ProyectoDocenteID int               `json:"proyecto_docente_id"`
	AsignaturaID      int               `json:"asignatura_id"`
	DocenteID         int               `json:"docente_id"`
	Fecha             time.Time         `json:"fecha"`
	Desarrollo        string            `json:"desarrollo"`
	Descripcion       string            `json:"descripcion"`
	PorcentajeAvance  int               `json:"porcentaje_avance"`
	Estado            EstadoSeguimiento `json:"estado"`
	Reporte           string            `json:"reporte,omitempty"`
	Observaciones     string            `json:"observaciones,omitempty"`
}

type Observacion struct {
	ID                int             `json:"id"`
	ProyectoDocenteID int             `json:"proyecto_docente_id"`
	AutorID           int             `json:"autor_id"`
	Tipo              TipoObservacion `json:"tipo"`
	Descripcion       string          `json:"descripcion"`
	Fecha             time.Time       `json:"fecha"`
	Autor             *Usuario        `json:"autor,omitempty"`
}

type Bibliografia struct {
	ID                int              `json:"id"`
	ProyectoDocenteID int              `json:"proyecto_docente_id"`
	Referencia        string           `json:"referencia"`
	Tipo              TipoBibliografia `json:"tipo"`
	URL               *string          `json:"url,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token   string  `json:"token"`
	Usuario Usuario `json:"usuario"`
}

type EnviarRequest struct {
	Observacion string `json:"observacion,omitempty"`
}

type AprobarRequest struct {
	Observacion string `json:"observacion,omitempty"`
}

type DevolverRequest struct {
	Observacion string `json:"observacion"`
}
