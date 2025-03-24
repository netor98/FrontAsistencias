import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserRepository } from "@domain/repositories/user/user.repository";
import { User } from "@domain/models/user.model";

@Injectable({
  providedIn: 'root'
})

// Aquí es donde se implementan la lógica de los métodos que declaramos en la interfaz del repositorio.

export class UserRepositoryImplementation implements UserRepository {

  private apiUrl = "https://jsonplaceholder.typicode.com/users";

  constructor(
    private http: HttpClient,
  ){}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`)
  }

}
