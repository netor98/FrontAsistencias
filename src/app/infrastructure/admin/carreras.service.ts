import { Injectable } from "@angular/core";
import { Carrera } from "@domain/models/carreras.model";

@Injectable({ providedIn: 'root' })
export class CarreraService {
  private carreras: Carrera[] = CARRERAS_FAKE;

  getCarreras(): Promise<Carrera[]> {
    return Promise.resolve(this.carreras);
  }
  searchCarreras(term: string): Promise<Carrera[]> {
    const lower = term.toLowerCase();
    const result = this.carreras.filter(c =>
      c.clave.toLowerCase().includes(lower) ||
      c.nombre.toLowerCase().includes(lower)
    );
    return Promise.resolve(result);
  }
  createCarrera(carrera: Carrera): Promise<void> {
    carrera.id = Math.max(...this.carreras.map(c => c.id)) + 1;
    this.carreras.push(carrera);
    return Promise.resolve();
  }

  deleteCarrera(id: number): Promise<void> {
    this.carreras = this.carreras.filter(c => c.id !== id);
    return Promise.resolve();
  }
}



const CARRERAS_FAKE: Carrera[] = [
  { id: 1, clave: 'ENG01', nombre: 'Ingeniería Industrial', activa: true, planId: 2021 },
  { id: 2, clave: 'CSC02', nombre: 'Ciencias de la Computación', activa: true, planId: 2020 },
  { id: 3, clave: 'ADM03', nombre: 'Administración de Empresas', activa: false, planId: 2019 },
  { id: 4, clave: 'MEC04', nombre: 'Ingeniería Mecánica', activa: true, planId: 2021 },
  { id: 5, clave: 'ELE05', nombre: 'Ingeniería Eléctrica', activa: true, planId: 2020 },
  { id: 6, clave: 'CIV06', nombre: 'Ingeniería Civil', activa: true, planId: 2021 },
  { id: 7, clave: 'QUI07', nombre: 'Ingeniería Química', activa: false, planId: 2019 },
  { id: 8, clave: 'BIO08', nombre: 'Biotecnología', activa: true, planId: 2020 },
  { id: 9, clave: 'MAT09', nombre: 'Estadística y Matemáticas Aplicadas', activa: true, planId: 2021 },
  { id: 10, clave: 'MED10', nombre: 'Medicina', activa: true, planId: 2021 },
  { id: 11, clave: 'DENT11', nombre: 'Odontología', activa: false, planId: 2019 },
  { id: 12, clave: 'PSI12', nombre: 'Psicología', activa: true, planId: 2020 },
  { id: 13, clave: 'ARQ13', nombre: 'Arquitectura', activa: true, planId: 2021 },
  { id: 14, clave: 'COM14', nombre: 'Comunicación Social', activa: true, planId: 2020 },
  { id: 15, clave: 'BIO15', nombre: 'Biología', activa: false, planId: 2019 },
  { id: 16, clave: 'FIS16', nombre: 'Física', activa: true, planId: 2020 },
  { id: 17, clave: 'QUI17', nombre: 'Química', activa: true, planId: 2021 },
  { id: 18, clave: 'SOC18', nombre: 'Sociología', activa: true, planId: 2019 },
  { id: 19, clave: 'ECN19', nombre: 'Economía', activa: true, planId: 2020 },
  { id: 20, clave: 'JUR20', nombre: 'Derecho', activa: true, planId: 2021 },
  { id: 21, clave: 'EDU21', nombre: 'Educación', activa: false, planId: 2019 },
  { id: 22, clave: 'ART22', nombre: 'Bellas Artes', activa: true, planId: 2020 },
  { id: 23, clave: 'ING23', nombre: 'Ingeniería en Sistemas', activa: true, planId: 2021 },
];
