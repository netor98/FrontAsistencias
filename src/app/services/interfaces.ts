// Interfaces para los tipos de datos
export interface Usuario {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'Alumno' | 'Jefe de grupo' | 'Checador' | 'Maestro' | 'Administrador';
  numero_cuenta?: string;
}

export interface Facultades {
  id: number;
  name: string;
}

export interface Edificios {
  id: number;
  name: string;
  facultad_id: number;
}

export interface Aulas {
  id: number;
  name: string;
  edificio_id: number;
}

export interface Carrera {
  id: number;
  nombre: string;
  semestres: number;
  plan: number;
}

export interface Materia {
  id: number;
  name: string;
  semestre: number;
  carrera_id: number;
  temario_url: string;
}

export interface Grupo {
  id: number;
  name: string;
  // classroom: string;
  //building: string;
  aula_id: number;
  jefe_nocuenta: string;
  carrera_id: number;
}

export interface HorarioMaestro {
  id: number;
  maestro_id: number;
  materia_id: number;
  grupo_id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface Asistencia {
  id: number;
  horario_id: number;
  fecha: string;
  asistencia: boolean;
  id_user: number;
}