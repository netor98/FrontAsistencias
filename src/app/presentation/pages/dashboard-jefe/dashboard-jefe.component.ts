import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeSectionUseCase } from '../../../application/usecases/dashboard/changeSection.usecase';
import { DashboardService } from '../../../infrastructure/dashboard/dashboard.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-jefe',
  imports: [FormsModule, CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-jefe.component.html',
  styleUrl: './dashboard-jefe.component.css'
})
export class DashboardJefeComponent {
  sidebarCollapsed = false;
  isMobile = false;
  isMobileSidebarHidden = true;

  constructor(
    private changeSectionUseCase: ChangeSectionUseCase,
    private dashboardService: DashboardService) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.dashboardService.currentTitle$.subscribe(title => {
      console.log(title)
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768; // md breakpoint in Tailwind

    if (wasMobile && !this.isMobile) {
      this.isMobileSidebarHidden = true; // Reset mobile sidebar state
    }
  }

  toggleSidebar(): void {
    if (!this.isMobile) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleMobileSidebar(): void {
    if (this.isMobile) {
      this.isMobileSidebarHidden = !this.isMobileSidebarHidden;
    }
  }

  changeSection(section: string): void {
    console.log(this.dashboardService.getTitle())
    console.log(section)
    this.changeSectionUseCase.execute(section);
  }
}
