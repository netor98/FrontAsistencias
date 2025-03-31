
import { Observable } from "rxjs";
import { Plan } from "../../models/planes.model";

export interface PlanesRepository {
  getAll(): Observable<Plan[]>;
  create(plan: Plan): Observable<Plan>;
  delete(id: number): Observable<void>;
  update(plan: Plan): Observable<Plan>;
}
