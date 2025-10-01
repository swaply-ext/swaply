import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginButtonComponent } from '../../components/login-button/login-button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    PasswordInputComponent,
    TermsCheckboxComponent,
    LoginButtonComponent,
    RouterLink
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  email: string = '';
  password: string = '';
  accepted: boolean = false;

  constructor(private router: Router) {}

  login() {
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }

    if (!this.email || !this.password) {
      alert('Debes rellenar todos los campos');
      return;
    }

    console.log('Datos de login:', {
      email: this.email,
      password: this.password
    });

    this.router.navigate(['/verify']);
  }
}
