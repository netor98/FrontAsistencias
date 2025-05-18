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
  jefe_nocuenta: string;
  carrera_id: number;
  aula_id: number;
}

export interface Materia {
  id?: number;
  name: string;
  semestre: number;
  carrera_id: number;
  temario_url?: string;
}

export interface Carrera {
  id?: number;
  nombre: string;
  semestres: number;
  plan: number;
}

export interface HorarioMaestro {
  id?: number;
  maestro_id: number;
  materia_id: number;
  grupo_id: number;
  dia: string;
  hora?: string;
  hora_inicio: string;
  hora_fin: string;
  asistencia?: boolean;
}

export interface Asistencia {
  id: number;
  horario_id: number;
  fecha?: string;
  asistencia?: string;
}
