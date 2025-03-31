import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Example token.

import { USER_REPOSITORY_TOKEN } from '@domain/repositories/user/user.repository.token';
import { UserRepositoryImplementation } from '@infrastructure/user/user.repository.implementation';
import { DASHBOARD_REPOSITORY_TOKEN } from './domain/repositories/dashboard/dashboard.repository.token';
import { DashboardService } from './infrastructure/dashboard/dashboard.service';
import { CARRERAS_REPOSITORY_TOKEN } from './domain/repositories/carreras/carreras.repository.token';
import { CarreraService } from './infrastructure/admin/carreras.service';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { PLANES_REPOSITORY_TOKEN } from './domain/repositories/planes/planes.repository.token';
import { PlanService } from './infrastructure/admin/planes.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),

    provideHotToastConfig(),
    // Clean architecture providers.
    { provide: USER_REPOSITORY_TOKEN, useClass: UserRepositoryImplementation },
    { provide: DASHBOARD_REPOSITORY_TOKEN, useClass: DashboardService },
    { provide: CARRERAS_REPOSITORY_TOKEN, useClass: CarreraService },
    { provide: PLANES_REPOSITORY_TOKEN, useClass: PlanService },
    provideHotToastConfig()

  ]
};
