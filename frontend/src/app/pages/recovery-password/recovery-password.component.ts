import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent {
  email: string = '';

  constructor(private router: Router) {}

  enviarCodigo() {
    if (!this.email) {
      alert('Por favor, introduce tu correo electrónico.');
      return;
    }
    
    console.log('Código de recuperación enviado a', this.email);
    
    this.router.navigate(['/verify']);
  }
  
  volverAtras() {
  this.router.navigate(['/']); 
}
}
