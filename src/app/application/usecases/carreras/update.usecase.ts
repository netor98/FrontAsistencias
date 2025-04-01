
import { Injectable, Inject } from "@angular/core";
import { Observable } from "rxjs";
import { CARRERAS_REPOSITORY_TOKEN } from "../../../domain/repositories/carreras/carreras.repository.token";
import { CarreraRepository } from "../../../domain/repositories/carreras/carreras.repository";
import { Carrera } from "../../../domain/models/carreras.model";

@Injectable({
  providedIn: 'root'
})

export class CarreeraUpdateUseCase {

  constructor(@Inject(CARRERAS_REPOSITORY_TOKEN) private carreraRepository: CarreraRepository) { }

  execute(id: number, carrera: Carrera): Observable<Carrera> {
    console.log(carrera)
    return this.carreraRepository.update(id, carrera);
  }

}
