import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PasswordInputComponent } from '@components/password-input/password-input.component';
import { authService } from '../../../../services/login';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [PasswordInputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { identifier, password, remember } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Utilizar el servicio de autenticación
      const loginResponse = await authService.login(identifier, password);
      
      if (loginResponse.success && loginResponse.user) {
        // Guardar la sesión y redirigir al usuario
        authService.saveUserSession(loginResponse.user, remember);
        this.handleNavigation(loginResponse.user);
      } else {
        this.errorMessage = loginResponse.error || 'Error al iniciar sesión';
      }
    } catch (error) {
      this.errorMessage = 'Error inesperado al procesar la solicitud';
      console.error('Error en inicio de sesión:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleNavigation(user: any) {
    // Redirigir según el rol del usuario
    switch (user.role) {
      case 'Administrador':
        this.router.navigate(['/admin']);
        console.log('Redirigiendo a Admin');
        break;
      case 'Jefe_de_Grupo':
        this.router.navigate(['/dashboard-jefe']);
        break;
      case 'Maestro':
        this.router.navigate(['/dashboard-maestro']);
        break;
      case 'Checador':
        this.router.navigate(['/dashboard-checador']);
        break;
      case 'Alumno':
        this.router.navigate(['/dashboard-alumno']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}