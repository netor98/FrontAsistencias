// Interfaces para los tipos de datos
export interface Usuario {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'Alumno' | 'Jefe de grupo' | 'Checador' | 'Maestro' | 'Administrador';
}

export interface Grupo {
  id?: number;
  name: string;
  classroom: string;
  building: string;
}

export interface Materia {
  id?: number;
  name: string;
  semestre: number;
  carrera_id: number;
}

export interface Carrera {
  id?: number;
  nombre: string;
  semestres: number;
}

export interface HorarioMaestro {
  id?: number;
  maestro_id: number;
  materia_id: number;
  grupo_id: number;
  dia: string;
  hora: string;
  asistencia: boolean;
}

export interface Asistencia {
  id: number;
  horario_id: number;
  fecha?: string;
  asistencia?: string;
}