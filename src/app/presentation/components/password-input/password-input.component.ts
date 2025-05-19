import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'password-input',
  imports: [CommonModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true
    }
  ]
})
export class PasswordInputComponent {
  @Input() label: string = 'Contraseña';
  @Input() inputId: string = 'password';
  @Input() placeholder: string = '••••••';
  @Input() labelClass: string = 'flex justify-between text-sm font-medium text-gray-600';
  @Input() iconTopPosition: string = 'top-[2.2rem]';
  @Input() formControlName?: string;

  showPassword: boolean = false;
  value: string = '';
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: any) {
    this.value = event.target.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
