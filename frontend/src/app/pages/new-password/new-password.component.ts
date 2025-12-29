import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { Router } from '@angular/router';
import { RecoveryDataService } from '../../services/recovery-data.service.service';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, PasswordInputComponent, ConfirmPasswordInputComponent],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  showError = false;
  token: string = '';
  message = '';

  // Constructor con inyección de dependencias: Location para navegación, Router para redirección, AuthService para peticiones HTTP
  constructor(
    private authService: AuthService,
    private router: Router,
    private recoveryService: RecoveryDataService,
    private location: Location,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParams['token'];
    
    console.log('Token recuperado:', this.token);
    if (!this.token) {
      alert('No token available. Vuelve a solicitar el mail.');
      this.router.navigate(['/recovery-password']);
      return;
    }
  }

  goBack() {
    this.location.back();
  }

  submitNewPassword() {
    this.showError = false;

    const passwordValidation = this.validatePassword(this.password);
    if (!passwordValidation.valid) {
      this.showError = true;
      this.message = 'Contraseña inválida:\n' + passwordValidation.message;
      return;
    }

    if (!this.password || !this.confirmPassword) {
      this.showError = true;
      this.message = 'Debes rellenar todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showError = true;
      this.message = 'Las contraseñas deben coincidir';
      return;
    }

    const data = this.recoveryService.getRecoveryData();
    const payload = { token: this.token, password: this.password };

    console.log('Payload para cambio de contraseña:', payload);

    this.authService.passwordReset(this.token, this.password)
      .subscribe({
        next: ok => {
          if (ok) {
            this.recoveryService.clear();
            this.router.navigate(['/confirm-password']);
          } else {
            this.showError = true;
            this.message = 'Error cambiando la contraseña';
          }
        },
        error: err => {
          console.error('Error al cambiar contraseña:', err);
          this.showError = true;
          if (err.status === 400 && err.error) {
            this.message = 'La contraseña no puede coincidir con las anteriores.';
          } else {
            this.message = 'Error de servidor. Inténtalo de nuevo más tarde';
          }
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
    this.password = newPassword;
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

