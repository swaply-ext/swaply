// ...existing code...
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { ConfirmPasswordInputComponent } from '../../components/confirm-password-input/confirm-password-input.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RecoveryDataService } from '../../services/recovery-data.service.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, PasswordInputComponent, ConfirmPasswordInputComponent, HttpClientModule],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {
  newPassword: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private recoveryService: RecoveryDataService
  ) {}

  ngOnInit() {}

  saveNewPassword() {
    const data = this.recoveryService.getRecoveryData();
    const payload = { id: data.id, password: this.newPassword };

    if (!payload.id) {
      alert('No user id available. Vuelve a solicitar el código.');
      this.router.navigate(['/recovery-password']);
      return;
    }

    this.http.post<{ success: boolean }>('http://localhost:8081/api/account/new-password', payload)
      .subscribe({
        next: res => {
          if ((res as any).success === true) {
            this.recoveryService.clear();
            this.router.navigate(['/confirmation']);
          } else {
            alert('Error cambiando la contraseña');
          }
        },
        error: err => {
          console.error('Error al cambiar contraseña:', err);
          alert('Error de conexión con el servidor');
        }
      });
  }
}