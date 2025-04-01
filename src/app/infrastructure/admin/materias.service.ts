
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Observable } from "rxjs";
import { MateriasRepository } from "@domain/repositories/materias/materias.repository";
import { Materia } from "@domain/models/materias.model";

@Injectable({ providedIn: 'root' })
export class MateriaService implements MateriasRepository {
  private API_URL = environment.API_URL;
  private materias: Materia[] = []

  constructor(private http: HttpClient) {
  }

  update(id: number, materia: Materia): Observable<Materia> {
    return this.http.patch<Materia>(`${this.API_URL}/materia/update/${id}`, materia);
  }

  getAll(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.API_URL}/materia`);
  }


  create(materia: Materia): Observable<Materia> {
    return this.http.post<Materia>(`${this.API_URL}/materia/create`, materia);
  }

  delete(id: number): Observable<void> {
    const url = `${this.API_URL}/materia/delete/${id}`;
    return this.http.delete<void>(url);
  }
}

