import { Component } from '@angular/core';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    CommonModule,
    PasswordInputComponent,
    ConfirmPasswordInputComponent,
    HttpClientModule
  ],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  previousPassword: string = '';
  message: string = '';
  passwordHistory: string[] = [];

  constructor(
    private location: Location,
     private router: Router,
      private http: HttpClient
    ) {}

  validatePassword(password: string): { valid: boolean; message: string } {
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
    if (password === this.previousPassword) return { valid: false, message: 'La nueva contraseña debe ser diferente de la anterior.' };
    if (password !== this.confirmPassword) return { valid: false, message: 'Las contraseñas no coinciden.' };

    return { valid: true, message: '' };
  }

   submitNewPassword(): void {
    const validation = this.validatePassword(this.newPassword);
    if (!validation.valid) {
      this.message = validation.message;
      console.log(this.message);
      return;
    }
    if (this.previousPassword) {
      this.passwordHistory.push(this.previousPassword);
    }
    this.previousPassword = this.newPassword;
    this.message = '¡Contraseña cambiada correctamente!';
    console.log(this.message);
    console.log('Historial de contraseñas:', this.passwordHistory);
    console.log('Contraseña actual:', this.previousPassword);
    //API evniar nueva pass a backend
    this.http.post('http://localhost:8081/api/new-password/save', { NewPasswordComponent: this.newPassword }) //envia el codigo de verificacion al endpoint de back y loc comprueban
    .subscribe({
      next: response => console.log('Respuesta del backend:', response),
      error: err => console.error('Error enviando dato:', err)
      });
    this.router.navigate(['/confirm-password']);

  }
  goBack(): void {
    this.location.back(); 
  }
}