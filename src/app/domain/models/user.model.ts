export class User {

    // En el constructor se declaran las propiedades del modelo.
  
    constructor(
      public id: string,
      public user: string,
      public rol: string,
      public status: boolean = true,
      public password?: string,
      public nombre?: string, 
      public apellidoPaterno?: string,
      public apellidoMaterno?: string,
      public noControl?: string,
      public carrera?: string
    ){}
  
  }
  