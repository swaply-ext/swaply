import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { ConfirmEmailInputComponent } from '../../components/confirm-email-input/confirm-email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { UsernameInputComponent } from "../../components/username-input/username-input.component";
import { RegisterDataService } from '../../services/register-data.service';
import { AlertService } from '../../services/alert.service';

interface User {
  username: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmailInputComponent,
    ConfirmEmailInputComponent,
    PasswordInputComponent,
    ConfirmPasswordInputComponent,
    TermsCheckboxComponent,
    ActionButtonsComponent,
    UsernameInputComponent,
    TermsConditionsComponent,
    PrivacyPolicyComponent
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent {
  username = '';
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';
  accepted = false;
  showError = false;
  hasErrorAll = false;
  message = '';
  showTermsModal = false;
  showPrivacyModal = false;

  constructor(
    private router: Router,
    private registerDataService: RegisterDataService,
    private alertService: AlertService
  ) { }

  register() {
    this.showError = false;
    this.username = this.username.toLowerCase();
    this.email = this.email.toLowerCase();
    this.confirmEmail = this.confirmEmail.toLowerCase();

    if (!this.accepted) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes aceptar los términos';
      return;
    }

    if (!this.username || !this.email || !this.confirmEmail || !this.password || !this.confirmPassword) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes rellenar todos los campos';
      return;
    }

    if (this.validateUsername(this.username)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir un nombre de usuario válido';
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Correo inválido. Debe contener "@" y formato correcto';
      return;
    }

    const passwordValidation = this.validatePassword(this.password);
    if (!passwordValidation.valid) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Contraseña inválida:\n' + passwordValidation.message;
      return;
    }

    if (this.email !== this.confirmEmail || this.password !== this.confirmPassword) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'El correo o la contraseña no coinciden';
      return;
    }

    const newUser = { username: this.username, email: this.email, password: this.password };

    this.registerDataService.initialRegister(newUser).subscribe({
      next: () => {
        this.registerDataService.setRegisterData(newUser);
        this.router.navigateByUrl('/code-sent-confirmation');
      },
      error: (err) => {
        const backendMessage = this.extractErrorMessage(err).toLowerCase();

        if (backendMessage.includes('username')) {
          this.alertService.show('warning', 'usernameInUse');
        } else if (backendMessage.includes('email')) {
          this.alertService.show('error', 'emailInUse');
        } else {
          this.alertService.show('error', 'registerFailed');
        }
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (err.message) return err.message;
    if (!err.error) return '';
    if (typeof err.error === 'string') return err.error;
    return err.error.message || err.error.text || JSON.stringify(err.error);
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePassword(password: string): { valid: boolean; message: string } {
    const minLength = 8;
    const maxLength = 64;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*?]/;
    const simpleSeq = /(1234|abcd|password|qwerty)/i;

    if (password.length < minLength) return { valid: false, message: `Debe tener al menos ${minLength} caracteres.` };
    if (password.length > maxLength) return { valid: false, message: `Debe tener como máximo ${maxLength} caracteres.` };
    if (!uppercase.test(password)) return { valid: false, message: 'Debe contener al menos una letra mayúscula.' };
    if (!lowercase.test(password)) return { valid: false, message: 'Debe contener al menos una letra minúscula.' };
    if (!number.test(password)) return { valid: false, message: 'Debe contener al menos un número.' };
    if (!special.test(password)) return { valid: false, message: 'Debe contener al menos un carácter especial (!@#$%^&*?).' };
    if (simpleSeq.test(password)) return { valid: false, message: 'No use secuencias simples o información personal.' };
    if (password.toLowerCase() === this.email.toLowerCase()) return { valid: false, message: 'No use su correo electrónico.' };
    if (password.toLowerCase() === this.username.toLowerCase()) return { valid: false, message: 'No use su nombre de usuario.' };

    return { valid: true, message: '' };
  }

  onPasswordChange(password: string) {
    this.password = password;
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      this.showError = true;
      this.message = 'Contraseña inválida:\n' + passwordValidation.message;
    } else {
      this.showError = false;
      this.message = '';
    }
  }

  private validateUsername(username: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requeriments = /^[a-z0-9_-]+$/;

    if (username.length < minLength) return true;
    if (username.length > maxLength) return true;
    if (!requeriments.test(username)) return true;
    return false;
  }
}