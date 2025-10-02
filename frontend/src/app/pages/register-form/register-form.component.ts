
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { ConfirmEmailInputComponent } from '../../components/confirm-email-input/confirm-email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

interface User {
  email: string;
  password: string;
  acceptedTerms: boolean;
}


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
    , HttpClientModule
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent {
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';
  accepted = false;


  // Array local para guardar usuarios registrados
  registeredUsers: User[] = [];

  constructor(private router: Router, private http: HttpClient) {}


  register() {
    if (!this.accepted) { alert('Debes aceptar los términos'); return; }
    if (!this.email || !this.password) { alert('Debes rellenar todos los campos'); return; }
    if (this.email !== this.confirmEmail) { alert('Los correos no coinciden'); return; }
    if (this.password !== this.confirmPassword) { alert('Las contraseñas no coinciden'); return; }


    const newUser: User = {
      email: this.email,
      password: this.password,
      acceptedTerms: this.accepted
    };


    // Guardar usuario localmente
    this.registeredUsers.push(newUser);
    console.log('Usuarios registrados:', this.registeredUsers);

    this.http.post('http://localhost:8081/api/register/guardar', { users: this.registeredUsers })
    .subscribe({
      next: response => console.log('Resposta del backend:', response),
      error: err => console.error('Error enviando usuarios:', err)
    });

    this.router.navigateByUrl('/verify');
  }
}



