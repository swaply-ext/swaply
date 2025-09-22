import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { ConfirmEmailInputComponent } from '../../components/confirm-email-input/confirm-email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    ConfirmEmailInputComponent,
    PasswordInputComponent,
    ConfirmPasswordInputComponent,
    TermsCheckboxComponent,
    ActionButtonsComponent
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent {
  accepted = false; 

  constructor(private router: Router) {}

 
  register() {
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }

    console.log('Registrando usuario...')

    this.router.navigateByUrl('/verify');
  }
}
