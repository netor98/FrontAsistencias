import { InjectionToken } from "@angular/core";
import { MateriasRepository } from "./materias.repository";

export const MATERIAS_REPOSITORY_TOKEN =
  new InjectionToken<MateriasRepository>('MateriasRepository');
