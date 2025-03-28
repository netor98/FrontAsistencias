import { Component } from '@angular/core';

import { PasswordInputComponent } from '@components/password-input/password-input.component';

@Component({
  selector: 'app-sign-in',
  imports: [ PasswordInputComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {

}
