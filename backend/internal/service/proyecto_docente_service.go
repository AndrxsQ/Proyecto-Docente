package service

import (
	"errors"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
	"time"
)

type ProyectoDocenteService struct {
	pdRepo            *repository.ProyectoDocenteRepository
	formatoRepo       *repository.FormatoRepository
	contenidoRepo     *repository.ContenidoRepository
	bibliografiaRepo  *repository.BibliografiaRepository
	observacionRepo   *repository.ObservacionRepository
}

func NewProyectoDocenteService(
	pdRepo *repository.ProyectoDocenteRepository,
	formatoRepo *repository.FormatoRepository,
	contenidoRepo *repository.ContenidoRepository,
	bibliografiaRepo *repository.BibliografiaRepository,
	observacionRepo *repository.ObservacionRepository,
) *ProyectoDocenteService {
	return &ProyectoDocenteService{
		pdRepo:           pdRepo,
		formatoRepo:      formatoRepo,
		contenidoRepo:    contenidoRepo,
		bibliografiaRepo: bibliografiaRepo,
		observacionRepo:  observacionRepo,
	}
}

func (s *ProyectoDocenteService) GetAll(filters map[string]interface{}) ([]models.ProyectoDocente, error) {
	return s.pdRepo.GetAll(filters)
}

func (s *ProyectoDocenteService) GetByID(id int) (*models.ProyectoDocente, error) {
	pd, err := s.pdRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if pd == nil {
		return nil, errors.New("proyecto docente no encontrado")
	}

	formato, _ := s.formatoRepo.GetByProyectoDocenteID(id)
	if formato != nil {
		pd.Formato = formato
	}

	contenido, _ := s.contenidoRepo.GetByProyectoDocenteID(id)
	pd.Contenido = contenido

	bibliografia, _ := s.bibliografiaRepo.GetByProyectoDocenteID(id)
	pd.Bibliografia = bibliografia

	observaciones, _ := s.observacionRepo.GetByProyectoDocenteID(id)
	pd.Observaciones = observaciones

	return pd, nil
}

func (s *ProyectoDocenteService) Create(cursoID, docenteID int) (*models.ProyectoDocente, error) {
	version, err := s.pdRepo.GetNextVersion(cursoID)
	if err != nil {
		return nil, err
	}

	pd := &models.ProyectoDocente{
		CursoID:           cursoID,
		Version:           version,
		Estado:            models.EstadoBorrador,
		Creacion:          time.Now(),
		UltimaModificacion: time.Now(),
		DocenteID:         docenteID,
		EstadoJefeDept:    models.EstadoRevisionPendiente,
		EstadoDirector:    models.EstadoRevisionPendiente,
		EstadoComite:      models.EstadoRevisionPendiente,
		EstadoDecano:      models.EstadoRevisionPendiente,
	}

	if err := s.pdRepo.Create(pd); err != nil {
		return nil, err
	}

	return pd, nil
}

func (s *ProyectoDocenteService) Update(pd *models.ProyectoDocente) error {
	pd.UltimaModificacion = time.Now()
	return s.pdRepo.Update(pd)
}

func (s *ProyectoDocenteService) Enviar(id int) error {
	pd, err := s.pdRepo.GetByID(id)
	if err != nil {
		return err
	}
	if pd == nil {
		return errors.New("proyecto docente no encontrado")
	}

	if pd.Estado != models.EstadoBorrador && pd.Estado != models.EstadoDevueltoDocente {
		return errors.New("solo se pueden enviar proyectos en estado BORRADOR o DEVUELTO_DOCENTE")
	}

	if err := s.validarRequisitos(id); err != nil {
		return err
	}

	pd.Estado = models.EstadoEnRevisionJefe
	pd.UltimaModificacion = time.Now()
	return s.pdRepo.Update(pd)
}

func (s *ProyectoDocenteService) Aprobar(id int, rol models.Rol, autorID int, observacion string) error {
	pd, err := s.pdRepo.GetByID(id)
	if err != nil {
		return err
	}
	if pd == nil {
		return errors.New("proyecto docente no encontrado")
	}

	switch rol {
	case models.RolJefeDepartamento, models.RolDirectorPrograma, models.RolCoordinadorPrograma:
		if pd.Estado != models.EstadoEnRevisionJefe {
			return errors.New("el proyecto no está en revisión por jefe/director")
		}
		pd.EstadoJefeDept = models.EstadoRevisionAprobado
		pd.EstadoDirector = models.EstadoRevisionAprobado
		pd.Estado = models.EstadoEnRevisionComite
	case models.RolComiteCurricular:
		if pd.Estado != models.EstadoEnRevisionComite {
			return errors.New("el proyecto no está en revisión por comité")
		}
		pd.EstadoComite = models.EstadoRevisionAprobado
		pd.Estado = models.EstadoEnAprobacionDecano
	case models.RolDecano:
		if pd.Estado != models.EstadoEnAprobacionDecano {
			return errors.New("el proyecto no está en aprobación por decano")
		}
		pd.EstadoDecano = models.EstadoRevisionAprobado
		pd.Estado = models.EstadoAprobado
	default:
		return errors.New("rol no autorizado para aprobar")
	}

	pd.UltimaModificacion = time.Now()
	if err := s.pdRepo.Update(pd); err != nil {
		return err
	}

	if observacion != "" {
		obs := &models.Observacion{
			ProyectoDocenteID: id,
			AutorID:           autorID,
			Tipo:              models.TipoObservacionAprobacion,
			Descripcion:       observacion,
			Fecha:             time.Now(),
		}
		s.observacionRepo.Create(obs)
	}

	return nil
}

func (s *ProyectoDocenteService) Devolver(id int, rol models.Rol, autorID int, observacion string) error {
	if observacion == "" {
		return errors.New("la observación es obligatoria para devolver")
	}

	pd, err := s.pdRepo.GetByID(id)
	if err != nil {
		return err
	}
	if pd == nil {
		return errors.New("proyecto docente no encontrado")
	}

	switch rol {
	case models.RolJefeDepartamento, models.RolDirectorPrograma, models.RolCoordinadorPrograma:
		if pd.Estado != models.EstadoEnRevisionJefe {
			return errors.New("el proyecto no está en revisión por jefe/director")
		}
		pd.EstadoJefeDept = models.EstadoRevisionDevuelto
		pd.EstadoDirector = models.EstadoRevisionDevuelto
	case models.RolComiteCurricular:
		if pd.Estado != models.EstadoEnRevisionComite {
			return errors.New("el proyecto no está en revisión por comité")
		}
		pd.EstadoComite = models.EstadoRevisionDevuelto
	case models.RolDecano:
		if pd.Estado != models.EstadoEnAprobacionDecano {
			return errors.New("el proyecto no está en aprobación por decano")
		}
		pd.EstadoDecano = models.EstadoRevisionDevuelto
	default:
		return errors.New("rol no autorizado para devolver")
	}

	pd.Estado = models.EstadoDevueltoDocente
	pd.UltimaModificacion = time.Now()
	if err := s.pdRepo.Update(pd); err != nil {
		return err
	}

	obs := &models.Observacion{
		ProyectoDocenteID: id,
		AutorID:           autorID,
		Tipo:              models.TipoObservacionDevolucion,
		Descripcion:       observacion,
		Fecha:             time.Now(),
	}
	s.observacionRepo.Create(obs)

	return nil
}

func (s *ProyectoDocenteService) validarRequisitos(pdID int) error {
	formato, err := s.formatoRepo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return err
	}
	if formato == nil || formato.ResultadosAprendizaje == "" || formato.EvaluacionResultados == "" {
		return errors.New("falta completar resultados de aprendizaje y criterios de evaluación")
	}

	contenido, err := s.contenidoRepo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return err
	}
	if len(contenido) == 0 {
		return errors.New("falta agregar contenido del curso (al menos una semana)")
	}

	bibliografia, err := s.bibliografiaRepo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return err
	}
	hasBasica := false
	for _, bib := range bibliografia {
		if bib.Tipo == models.TipoBibliografiaBasica {
			hasBasica = true
			break
		}
	}
	if !hasBasica {
		return errors.New("falta agregar al menos una bibliografía básica")
	}

	return nil
}
