import { Observable } from 'rxjs';
import { Materia } from '../../models/materia.model';

export interface MateriaRepository {
  getAllMaterias(): Observable<Materia[]>;
  getMateriaById(id: number): Observable<Materia>;
  createMateria(materia: Omit<Materia, 'id'>): Observable<Materia>;
  updateMateria(id: number, materia: Partial<Materia>): Observable<Materia>;
  deleteMateria(id: number): Observable<void>;
} 