import { InjectionToken } from "@angular/core";
import { UserRepository } from "./user.repository";

// Este token se tiene que generar para cada repositorio para poder colocarlo como provider en app.config.ts
// Si no se coloca, no se podrá injectar a servicios, componentes, archivos, etc.

export const USER_REPOSITORY_TOKEN = new InjectionToken<UserRepository>('UserRepository');
