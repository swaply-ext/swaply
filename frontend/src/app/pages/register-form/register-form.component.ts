import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { ConfirmEmailInputComponent } from '../../components/confirm-email-input/confirm-email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RegisterDataService } from '../../services/register-data.service';

interface User {
  email: string;
  password: string;
  acceptedTerms: boolean;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
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
  // Propiedades que almacenan el estado del formulario
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';
  accepted = false;
  showError = false;
  hasErrorAll = false;


  // Constructor con inyección de dependencias: Router para navegación, HttpClient para peticiones HTTP, RegisterDataService para compartir datos entre componentes
  constructor(private router: Router, private http: HttpClient, private registerDataService: RegisterDataService) {}

  // Función que maneja el registro del usuario
  register() {
    this.showError = false;

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

    const passwordValidation = this.validatePassword(this.password);
    if (!passwordValidation.valid) {
      alert('Contraseña inválida:\n' + passwordValidation.message);
      return;
    }

    if (this.email !== this.confirmEmail || this.password !== this.confirmPassword) {
      this.showError = true;
      this.hasErrorAll = true;
      return;
    }

    const newUser = {
      email: this.email,
      password: this.password
    };
    // estem guardant les dades al servei per acumular-los i enviarlos a commponent personal-info
    this.registerDataService.setRegisterData(newUser);

    this.router.navigateByUrl('/personal-information');
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
