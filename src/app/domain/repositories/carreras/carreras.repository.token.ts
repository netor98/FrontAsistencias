import { InjectionToken } from "@angular/core";
import { CarreraRepository } from "./carreras.repository";

export const CARRERAS_REPOSITORY_TOKEN =
  new InjectionToken<CarreraRepository>('CarrerasRepository');
