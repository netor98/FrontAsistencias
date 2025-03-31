
import { InjectionToken } from "@angular/core";
import { PlanesRepository } from "./planes.repository";

export const PLANES_REPOSITORY_TOKEN =
  new InjectionToken<PlanesRepository>('PlanesRepository');
