import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeSectionUseCase } from '../../../application/usecases/dashboard/changeSection.usecase';
import { DashboardService } from '../../../infrastructure/dashboard/dashboard.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
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
    // Initialize mobile detection
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768; // md breakpoint in Tailwind
    // If transitioning from mobile to desktop
    if (wasMobile && !this.isMobile) {
      this.isMobileSidebarHidden = true; // Reset mobile sidebar state
    }
  }

  toggleSidebar(): void {
    // Only toggle collapse state on desktop
    if (!this.isMobile) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleMobileSidebar(): void {
    // Only toggle visibility on mobile
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
