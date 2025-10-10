import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginButtonComponent } from '../../components/login-button/login-button.component';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
 
interface User {
  email: string;
  password: string;
 
}
 
@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    PasswordInputComponent,
    TermsCheckboxComponent,
    RouterLink,
    LoginRegisterButtonsComponent,
    HttpClientModule
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  email = '';
  password = '';
  accepted = false;
 
 
  constructor(private router: Router, private http: HttpClient) { }
 
  login() {
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }
    if (!this.email || !this.password) {
      alert('Debes rellenar todos los campos');
      return;
    }
 
    const newUser: User = {
      email: this.email,
      password: this.password
    };
 
 
    console.log('Usuario logueado:', newUser);
 
    this.http.post('http://localhost:8081/api/login/check', newUser )
      .subscribe({
        next: response => console.log('Respuesta del backend:', response),
        error: err => console.error('Error enviando login:', err)
      });
 
    this.router.navigate(['/']);
  }

  register() {
  this.router.navigate(['/register']);
}
}