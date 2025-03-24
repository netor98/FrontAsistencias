import { Inject, Injectable } from "@angular/core";
import { DashboardRepository } from "../../../domain/repositories/dashboard/dashboard.repository";
import { DASHBOARD_REPOSITORY_TOKEN } from "../../../domain/repositories/dashboard/dashboard.repository.token";


@Injectable({
  providedIn: 'root'
})

export class ChangeSectionUseCase {

  constructor(@Inject(DASHBOARD_REPOSITORY_TOKEN) private dashboardRepository: DashboardRepository) { }
  execute(section: string): void {
    this.dashboardRepository.setTitle(section);
  }
}
