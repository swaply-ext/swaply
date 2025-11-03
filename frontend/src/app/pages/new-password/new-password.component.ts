import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { Router } from '@angular/router';
import { RecoveryDataService } from '../../services/recovery-data.service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, PasswordInputComponent, ConfirmPasswordInputComponent],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  showError = false;
  message = '';

  // Constructor con inyección de dependencias: Location para navegación, Router para redirección, HttpClient para peticiones HTTP
  constructor(
    private http: HttpClient,
    private router: Router,
    private recoveryService: RecoveryDataService,
    private location: Location
  ) { }

  ngOnInit() { }

  goBack() {
    this.location.back();
  }

  submitNewPassword() {
    this.showError = false;

    const passwordValidation = this.validatePassword(this.newPassword);
    if (!passwordValidation.valid) {
      this.showError = true;
      this.message = 'Contraseña inválida:\n' + passwordValidation.message;
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.showError = true;
      this.message = 'Debes rellenar todos los campos';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showError = true;
      this.message = 'Las contraseñas deben coincidir';
      return;
    }

    const data = this.recoveryService.getRecoveryData();
    const payload = { Id: data.id, newPassword: this.newPassword };

    if (!payload.Id) {
      this.showError = true;
      this.message = 'Error. Vuelve a solicitar el código.';
      this.router.navigate(['/recovery-password']);
      return;
    }


    this.http.post<boolean>(
      'http://localhost:8081/api/account/new-password',
      { id: data.id, newPassword: this.newPassword }
    ).subscribe({
      next: ok => {
        if (ok) {
          this.recoveryService.clear();
          this.router.navigate(['/confirmation']);
        } else {
          this.showError = true;
          this.message = 'Error cambiando la contraseña';
        }
      },
      error: err => {
        console.error('Error al cambiar contraseña:', err);
        this.showError = true;
        this.message = 'Error de servidor. Intentalo de nuevo más tarde';
      }
    });

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
  onPasswordChange(newPassword: string) {
    this.newPassword = newPassword;
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      this.showError = true;
      this.message = 'Contraseña inválida:\n' + passwordValidation.message;
    } else {
      this.showError = false;
      this.message = '';
    }
  }
}

