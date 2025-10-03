import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface User {
  email: string;
}

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent {
  email: string = '';

  registeredUsers: User[] = [
    { email: 'test@example.com' }
  ];

  constructor(private router: Router, private location: Location) {}

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

    console.log('Código de recuperación enviado a', foundUser.email);
    this.router.navigate(['/verify']);
  }

  volverAtras() {
    this.location.back();
  }
}
