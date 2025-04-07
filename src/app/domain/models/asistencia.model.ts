export class Asistencia {
  constructor(
    public id: number,
    public fecha: string,
    public hora_Inicio: string,
    public hora_Fin: string,
    public dia: string,
    public profesor: {
      id: number;
      nombre: string;
    },
    public jefeGrupo?: {
      id: number;
      nombre: string;
    },
    public materia?: string,
    public aula?: string,
    public asistencia_Profesor?: boolean | null,
    public asistencia_Alumno?: boolean | null,
    public asistencia_Checador?: boolean | null,
    public isComplete?: boolean,
    public isConsistent?: boolean,
    public status?: 'incomplete' | 'present' | 'absent' | 'conflict'
  ) {}
}

export interface AsistenciaComparison {
  summary: {
    totalRecords: number;
    completedRecords: number;
    consistentRecords: number;
    completionRate: number;
    consistencyRate: number;
  };
  records: Asistencia[];
}

export interface CompareAsistenciasRequest {
  materiaxgrupoId: string;
  fecha_Inicio: string;
  fecha_Fin?: string;
} 