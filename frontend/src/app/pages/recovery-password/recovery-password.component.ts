import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

interface User {
  email: string;
}

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent {
  email: string = '';

  constructor(private router: Router, private location: Location, private http: HttpClient) { }

  enviarCodigo() {
    if (!this.email) {
      alert('Por favor, introduce tu correo electrónico.');
      return;
    }

    this.http.post('http://localhost:8081/api/account/recoveryCode', this.email)
      .subscribe({
        next: response => {
          console.log('Respuesta del backend:', response);
          this.router.navigate(['/verify'], {state: {code: response}});
        },
        error: err => console.error('Error enviando dato:', err),
      });

    console.log('Código de recuperación enviado a', this.email);
  }

  volverAtras() {
    this.location.back();
  }
}
