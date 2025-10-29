import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface User {
  email: string;
}

@Component({
  selector: 'app-recovery-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recovery-email.component.html',
  styleUrls: ['./recovery-email.component.css']
})
export class RecoveryEmailComponent {
  // Variable para almacenar el correo electrónico del usuario
  email: string = '';
  // Variable para almacenar el código de verificación recibido del backend
  constructor(
    private router: Router,
    private location: Location,
    private http: HttpClient
  ) {}

  // Función para manejar el envío del formulario
  enviarCodigo() {
    if (!this.email) {
      alert('Por favor, introduce tu correo electrónico.');
      return;
    }
    // Envía una petición POST al backend con el correo electrónico
    this.http.post('http://localhost:8081/api/account/verifyCode', this.email)
      .subscribe({
        next: response => {
          console.log('Respuesta del backend:', response);
          this.router.navigate(['/verify'], { state: { code: response } });
        },
        error: err => console.error('Error enviando dato:', err),
      });
      
    console.log('Código de recuperación enviado a', this.email);
  }

  volverAtras() {
    this.location.back();
  }
}
