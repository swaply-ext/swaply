import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { RecoveryDataService } from '../../services/recovery-data.service.service';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent {
  email: string = '';

  constructor(
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private recoveryService: RecoveryDataService
  ) {}

  enviarCodigo() {
    if (!this.email) {
      alert('Por favor, introduce tu correo electrónico.');
      return;
    }

    // Enviar JSON { email: ... }
  this.http.post<{ userId?: string; id?: string; codeString?: string; code?: string }>(
    'http://localhost:8081/api/account/recoveryCode',
    this.email 
      ).subscribe({
    next: ({ userId, code }) => {
      this.recoveryService.setRecoveryData({ id: userId, code, email: this.email });
      this.router.navigate(['/pass-verification']);
    },

        error: err => {
          console.error('Error enviando dato:', err);
          alert('Error enviando el correo. Intenta de nuevo.');
        },
      });

    console.log('Solicitud de código enviada para', this.email);
  }

  volverAtras() {
    this.location.back();
  }
}