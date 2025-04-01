import { Injectable } from "@angular/core";
import { CarreraRepository } from "../../domain/repositories/carreras/carreras.repository";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Observable } from "rxjs";
import { Carrera } from "../../domain/models/carreras.model";

@Injectable({ providedIn: 'root' })
export class CarreraService implements CarreraRepository {
  private API_URL = environment.API_URL;
  private carreras: Carrera[] = []

  constructor(private http: HttpClient) {
  }
  update(id: number, carrera: Carrera): Observable<Carrera> {
    return this.http.patch<Carrera>(`${this.API_URL}/carrera/update/${id}`, carrera);
  }

  getAll(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.API_URL}/carrera/getAll`);
  }

  getCarreras(): Promise<Carrera[]> {
    return Promise.resolve(this.carreras);
  }

  searchCarreras(term: string): Observable<Carrera[]> {
    const url = `${this.API_URL}?search=${term}`; // Assuming your API supports search via query params
    return this.http.get<Carrera[]>(url);
  }

  create(carrera: Carrera): Observable<Carrera> {
    return this.http.post<Carrera>(`${this.API_URL}/carrera/create`, carrera);
  }

  delete(id: number): Observable<void> {
    const url = `${this.API_URL}/carrera/delete/${id}`;
    return this.http.delete<void>(url);
  }

}

