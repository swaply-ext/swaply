import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  confirmPassword: string = '';

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
    if (!this.newPassword || !this.confirmPassword) {
      alert('Por favor, completa ambos campos.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const data = this.recoveryService.getRecoveryData();
    const payload = { Id: data.id, newPassword: this.newPassword };

    if (!payload.Id) {
      alert('No user id available. Vuelve a solicitar el código.');
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
