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

  registeredUsers: User[] = [ //aqui hace falta recibir de una consulta a bd los email de users regstradirs
    { email: 'test@example.com' } //hay uno de ejemplo
  ];

  constructor(private router: Router, private location: Location, private http: HttpClient) {}

  enviarCodigo() {
    if (!this.email) {
      alert('Por favor, introduce tu correo electrónico.');
      return;
    }

    const foundUser = this.registeredUsers.find(u => u.email === this.email);

    if (!foundUser) {
      alert(' El correo no está registrado.');
      return;
    }
    this.http.post('http://localhost:8081/api/recovery-pass', { email: this.email }) //enviamos el "email" del input a back para que le envien un correo de verificacion i / o email para restablecer contra
    .subscribe({
      next: response => console.log('Respuesta del backend:', response),
      error: err => console.error('Error enviando dato:', err)
    });

    console.log('Código de recuperación enviado a', foundUser.email); 
    this.router.navigate(['/verify']);
  }

  volverAtras() {
    this.location.back();
  }
}
