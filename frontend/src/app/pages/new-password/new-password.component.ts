import { Component } from '@angular/core';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    PasswordInputComponent,
    ConfirmPasswordInputComponent
  ],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';

  isFormValid(): boolean {
    return this.newPassword.length >= 6 && this.newPassword === this.confirmPassword;
  }

  submitNewPassword(): void {
    if (!this.isFormValid()) return;

    console.log('Contraseña nueva enviada:', this.newPassword);
    // Aquí podrías llamar a tu servicio API para actualizar la contraseña
  }
}
