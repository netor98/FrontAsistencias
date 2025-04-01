
import { Observable } from "rxjs";
import { Materia } from "@domain/models/materias.model";

export interface MateriasRepository {
  getAll(): Observable<Materia[]>;
  create(carrera: Materia): Observable<Materia>;
  delete(id: number): Observable<void>;
  update(id: number, carrera: Materia): Observable<Materia>;
}
