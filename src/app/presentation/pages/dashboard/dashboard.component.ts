import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  sidebarCollapsed = false;
  isMobile = false;
  isMobileSidebarHidden = true;

  constructor() {
    this.checkScreenSize();
  }

  ngOnInit(): void {
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
}
