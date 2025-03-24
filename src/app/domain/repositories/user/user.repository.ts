import { Observable } from "rxjs";

// Se importa el modelo de los datos.

import { User } from "@domain/models/user.model";

// Aquí se declaran los métodos que llevará el modelo pero no se implementan.

export interface UserRepository {

  // Función que retorna un array con el formato del modelo.

  getUsers(): Observable<User[]>;

}
