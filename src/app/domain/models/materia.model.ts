export class Materia {
  constructor(
    public id: number,
    public clave: string,
    public nombre: string,
    public creditos: number,
    public temario: string[],
    public carreraId: number,
    public carreraNombre?: string
  ) {}
} 