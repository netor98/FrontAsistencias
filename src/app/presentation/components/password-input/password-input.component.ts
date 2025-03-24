import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'password-input',
  imports: [CommonModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.css'
})
export class PasswordInputComponent {
  @Input() label: string = 'Contraseña';
  @Input() inputId: string = 'password';
  @Input() placeholder: string = '••••••';
  @Input() labelClass: string = 'flex justify-between text-sm font-medium text-gray-600';
  @Input() iconTopPosition: string = 'top-[2.2rem]';

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
