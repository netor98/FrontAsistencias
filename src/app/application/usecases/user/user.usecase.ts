import { Injectable, Inject } from "@angular/core";
import { UserRepository } from "@domain/repositories/user/user.repository";
import { Observable } from "rxjs";
import { USER_REPOSITORY_TOKEN } from "@domain/repositories/user/user.repository.token";
import { User } from "@domain/models/user.model";

@Injectable({
  providedIn: 'root'
})

export class UserUseCase {

  // Injectamos el token del repositorio para poder instanciar el repositorio como tal.

  constructor(@Inject(USER_REPOSITORY_TOKEN) private userRepository: UserRepository){}

  // Ejecutamos la función, esto lo que hace es que ejecuta la lógica declarada en la implementación del repositorio.
  // Ya que ese archivo implementa el UserRepository.

  execute(): Observable<User[]>{
    return this.userRepository.getUsers();
  }

}
