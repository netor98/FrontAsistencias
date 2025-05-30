import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeSectionUseCase } from '../../../application/usecases/dashboard/changeSection.usecase';
import { DashboardService } from '../../../infrastructure/dashboard/dashboard.service';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { authService, User } from '../../../services/login';

@Component({
  selector: 'app-dashboard-maestro',
  imports: [FormsModule, CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-maestro.component.html',
  styleUrl: './dashboard-maestro.component.css'
})
export class DashboardMaestroComponent implements OnInit {
  sidebarCollapsed = false;
  isMobile = false;
  isMobileSidebarHidden = true;
  currentUser: User | null = null;
  userInitials: string = '';

  constructor(
    private changeSectionUseCase: ChangeSectionUseCase,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
    this.dashboardService.currentTitle$.subscribe(title => {
      console.log(title)
    });
  }

  loadUserData(): void {
    this.currentUser = authService.getCurrentUser();
    if (!this.currentUser) {
      // Si no hay usuario autenticado, redirigir al login
      this.router.navigate(['/auth/sign-in']);
      return;
    }
    
    // Generar iniciales del usuario
    this.generateUserInitials();
  }

  generateUserInitials(): void {
    if (!this.currentUser) return;
    
    // Si tiene nombre y apellido
    if (this.currentUser.name) {
      // Dividir el nombre en palabras
      const nameParts = this.currentUser.name.split(' ');
      
      if (nameParts.length > 1) {
        // Si hay al menos dos palabras, usar la primera letra de la primera y última palabra
        this.userInitials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      } else {
        // Si solo hay una palabra, usar las dos primeras letras o la primera letra repetida
        this.userInitials = nameParts[0].length > 1 
          ? `${nameParts[0].charAt(0)}${nameParts[0].charAt(1)}`.toUpperCase()
          : `${nameParts[0].charAt(0)}${nameParts[0].charAt(0)}`.toUpperCase();
      }
    } 
    // Si solo tiene email
    else if (this.currentUser.email) {
      this.userInitials = this.currentUser.email.charAt(0).toUpperCase();
    } 
    // Fallback a iniciales genéricas
    else {
      this.userInitials = 'MT';  // MT = Maestro
    }
  }

  logout(): void {
    authService.logout();
    this.router.navigate(['/auth/sign-in']);
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