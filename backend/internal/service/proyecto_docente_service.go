package service

import (
	"errors"
	"fmt"
	"proyecto-docente/internal/models"
	"proyecto-docente/internal/repository"
	"time"
)

type ProyectoDocenteService struct {
	pdRepo                        *repository.ProyectoDocenteRepository
	formatoRepo                   *repository.FormatoRepository
	contenidoRepo                 *repository.ContenidoRepository
	bibliografiaRepo              *repository.BibliografiaRepository
	observacionRepo               *repository.ObservacionRepository
	resultadoAprendizajeCursoRepo *repository.ResultadoAprendizajeCursoRepository
}

func NewProyectoDocenteService(
	pdRepo *repository.ProyectoDocenteRepository,
	formatoRepo *repository.FormatoRepository,
	contenidoRepo *repository.ContenidoRepository,
	bibliografiaRepo *repository.BibliografiaRepository,
	observacionRepo *repository.ObservacionRepository,
	resultadoAprendizajeCursoRepo *repository.ResultadoAprendizajeCursoRepository,
) *ProyectoDocenteService {
	return &ProyectoDocenteService{
		pdRepo:                        pdRepo,
		formatoRepo:                   formatoRepo,
		contenidoRepo:                 contenidoRepo,
		bibliografiaRepo:              bibliografiaRepo,
		observacionRepo:               observacionRepo,
		resultadoAprendizajeCursoRepo: resultadoAprendizajeCursoRepo,
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

func (s *ProyectoDocenteService) Create(asignaturaID, docenteID, sesionesPorSemana int) (*models.ProyectoDocente, error) {
	version, err := s.pdRepo.GetNextVersion(asignaturaID)
	if err != nil {
		return nil, err
	}

	pd := &models.ProyectoDocente{
		AsignaturaID:       asignaturaID,
		Version:            version,
		Estado:             models.EstadoElaborado,
		Creacion:           time.Now(),
		UltimaModificacion: time.Now(),
		DocenteID:          docenteID,
		SesionesPorSemana:  sesionesPorSemana,
		EstadoJefeDept:     models.EstadoRevisionPendiente,
		EstadoDirector:     models.EstadoRevisionPendiente,
		EstadoComite:       models.EstadoRevisionPendiente,
		EstadoDecano:       models.EstadoRevisionPendiente,
		Activo:             false, // New projects are inactive by default
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
	fmt.Printf("DEBUG SERVICE: Enviar called - ID: %d\n", id)

	pd, err := s.pdRepo.GetByID(id)
	if err != nil {
		fmt.Printf("DEBUG SERVICE: Error getting proyecto: %v\n", err)
		return err
	}
	if pd == nil {
		fmt.Printf("DEBUG SERVICE: Proyecto not found\n")
		return errors.New("proyecto docente no encontrado")
	}

	fmt.Printf("DEBUG SERVICE: Proyecto estado actual: %s\n", pd.Estado)

	if pd.Estado != models.EstadoElaborado {
		fmt.Printf("DEBUG SERVICE: Invalid state, expected ELABORADO\n")
		return errors.New("solo se pueden enviar proyectos en estado ELABORADO")
	}

	fmt.Printf("DEBUG SERVICE: Validating requisitos\n")
	if err := s.validarRequisitos(id); err != nil {
		fmt.Printf("DEBUG SERVICE: Requisitos validation failed: %v\n", err)
		return err
	}

	pd.Estado = models.EstadoEnRevision
	pd.UltimaModificacion = time.Now()
	fmt.Printf("DEBUG SERVICE: Updating proyecto to EN_REVISION\n")
	if err := s.pdRepo.Update(pd); err != nil {
		fmt.Printf("DEBUG SERVICE: Error updating proyecto: %v\n", err)
		return err
	}

	fmt.Printf("DEBUG SERVICE: Enviar successful\n")
	return nil
}

func (s *ProyectoDocenteService) Aprobar(id int, rol models.Rol, autorID int, observacion string) error {
	fmt.Printf("DEBUG SERVICE: Aprobar called - ID: %d, Rol: %s, AutorID: %d\n", id, rol, autorID)

	pd, err := s.pdRepo.GetByID(id)
	if err != nil {
		fmt.Printf("DEBUG SERVICE: Error getting proyecto: %v\n", err)
		return err
	}
	if pd == nil {
		fmt.Printf("DEBUG SERVICE: Proyecto not found\n")
		return errors.New("proyecto docente no encontrado")
	}

	fmt.Printf("DEBUG SERVICE: Proyecto estado actual: %s\n", pd.Estado)

	grupo := rol.GetGrupo()
	fmt.Printf("DEBUG SERVICE: User permission group: %s\n", grupo)

	switch grupo {
	case models.GrupoRevision:
		fmt.Printf("DEBUG SERVICE: Checking REVISION group\n")
		if pd.Estado != models.EstadoEnRevision {
			return errors.New("el proyecto no está en revisión")
		}
		pd.Estado = models.EstadoRevisado
	case models.GrupoComite:
		fmt.Printf("DEBUG SERVICE: Checking COMITE group\n")
		if pd.Estado != models.EstadoRevisado {
			return errors.New("el proyecto no está revisado")
		}
		pd.Estado = models.EstadoAvalado
	case models.GrupoAprobacionFinal:
		fmt.Printf("DEBUG SERVICE: Checking APROBACION_FINAL group\n")
		if pd.Estado != models.EstadoAvalado {
			return errors.New("el proyecto no está avalado")
		}
		pd.Estado = models.EstadoAprobado
		// Activate this project and deactivate all others for the same asignatura
		if err := s.pdRepo.DeactivateAllForAsignatura(pd.AsignaturaID); err != nil {
			fmt.Printf("DEBUG SERVICE: Error deactivating other projects: %v\n", err)
			return err
		}
		pd.Activo = true
		if err := s.pdRepo.ActivateProject(id); err != nil {
			fmt.Printf("DEBUG SERVICE: Error activating project: %v\n", err)
			return err
		}
		fmt.Printf("DEBUG SERVICE: Project activated, others deactivated\n")
	default:
		fmt.Printf("DEBUG SERVICE: Unauthorized group: %s\n", grupo)
		return errors.New("grupo no autorizado para aprobar")
	}

	fmt.Printf("DEBUG SERVICE: New state will be: %s\n", pd.Estado)

	pd.UltimaModificacion = time.Now()
	if err := s.pdRepo.Update(pd); err != nil {
		fmt.Printf("DEBUG SERVICE: Error updating proyecto: %v\n", err)
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

	fmt.Printf("DEBUG SERVICE: Aprobar successful\n")
	return nil
}

func (s *ProyectoDocenteService) validarRequisitos(pdID int) error {
	formato, err := s.formatoRepo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return err
	}
	if formato == nil || formato.EvaluacionResultados == "" {
		return errors.New("falta completar criterios de evaluación")
	}

	// Validate resultados de aprendizaje using the new structure
	resultadosAprendizajeCurso, err := s.resultadoAprendizajeCursoRepo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return err
	}
	if len(resultadosAprendizajeCurso) == 0 {
		return errors.New("falta agregar contribuciones a los resultados de aprendizaje")
	}
	// Check that each contribution has both resultado_aprendizaje_id and contribucion_programa
	for _, rac := range resultadosAprendizajeCurso {
		if rac.ResultadoAprendizajeID == nil || *rac.ResultadoAprendizajeID == 0 {
			return errors.New("cada contribución debe estar vinculada a un resultado de aprendizaje")
		}
		if rac.ContribucionPrograma == "" {
			return errors.New("cada contribución debe tener una descripción")
		}
	}

	contenido, err := s.contenidoRepo.GetByProyectoDocenteID(pdID)
	if err != nil {
		return err
	}
	if len(contenido) == 0 {
		return errors.New("falta agregar contenido de la asignatura (al menos una semana)")
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
