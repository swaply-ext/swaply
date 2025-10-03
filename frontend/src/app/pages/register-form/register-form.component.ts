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
    ActionButtonsComponent,
    HttpClientModule
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

  registeredUsers: User[] = [];

constructor(private router: Router, private http: HttpClient) {}

  register() {
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }

    if (!this.email || !this.confirmEmail || !this.password || !this.confirmPassword) {
      alert('Debes rellenar todos los campos');
      return;
    }

    if (!this.validateEmail(this.email)) {
      alert('Correo inválido. Debe contener "@" y formato correcto.');
      return;
    }

    if (this.email !== this.confirmEmail) {
      alert('Los correos no coinciden');
      return;
    }

    const passwordValidation = this.validatePassword(this.password);
    if (!passwordValidation.valid) {
      alert('Contraseña inválida:\n' + passwordValidation.message);
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const newUser: User = {
      email: this.email,
      password: this.password,
      acceptedTerms: this.accepted
    };

    this.registeredUsers.push(newUser);
    console.log('Usuarios registrados:', this.registeredUsers);
    
    this.http.post('http://localhost:8081/api/register/save', { users: this.registeredUsers })
    .subscribe({
      next: response => console.log('Respuesta del backend:', response),
      error: err => console.error('Error enviando usuarios:', err)
    });

    this.router.navigateByUrl('/verify');
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePassword(password: string): { valid: boolean; message: string } {
    const minLength = 8;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*?]/;
    const simpleSeq = /(1234|abcd|password|qwerty)/i;

    if (password.length < minLength) return { valid: false, message: `Debe tener al menos ${minLength} caracteres.` };
    if (!uppercase.test(password)) return { valid: false, message: 'Debe contener al menos una letra mayúscula.' };
    if (!lowercase.test(password)) return { valid: false, message: 'Debe contener al menos una letra minúscula.' };
    if (!number.test(password)) return { valid: false, message: 'Debe contener al menos un número.' };
    if (!special.test(password)) return { valid: false, message: 'Debe contener al menos un carácter especial (!@#$%^&*?).' };
    if (simpleSeq.test(password)) return { valid: false, message: 'No use secuencias simples o información personal.' };

    return { valid: true, message: '' };
  }
}


