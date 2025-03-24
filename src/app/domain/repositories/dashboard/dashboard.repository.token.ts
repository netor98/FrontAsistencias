import { InjectionToken } from "@angular/core";
import { DashboardRepository } from "./dashboard.repository";

export const DASHBOARD_REPOSITORY_TOKEN =
  new InjectionToken<DashboardRepository>('DashboardRepository');
