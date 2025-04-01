import { Observable } from "rxjs";
import { Carrera } from "../../models/carreras.model";

export interface CarreraRepository {
  getAll(): Observable<Carrera[]>;
  create(carrera: Carrera): Observable<Carrera>;
  delete(id: number): Observable<void>;
  update(id: number, carrera: Carrera): Observable<Carrera>;
}
