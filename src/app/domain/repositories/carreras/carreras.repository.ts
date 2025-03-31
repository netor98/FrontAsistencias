import { Observable } from "rxjs";
import { Carrera } from "../../models/carreras.model";

export interface CarreraRepository {
  getAll(): Observable<Carrera[]>;
  create(carrera: Carrera): Observable<Carrera>;
  delete(id: number): Observable<void>;
  update(carrera: Carrera): Observable<Carrera>;
}
