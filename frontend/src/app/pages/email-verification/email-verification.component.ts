import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent {
  
  code: string[] = ['', '', '', '', '', ''];

  private readonly validCode = '131313'; //codigo de ejemplo, HACE FALTA HACER UNA PETICIÓN GET A BACKEND DEL CODIGO DE VERIFICACION ENVIADO AL CORREO

  constructor(private location: Location, private router: Router, private http: HttpClient) {}

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); 
    input.value = value; 
    this.code[index] = value;

    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      next?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  verifyCode(): void {
    const fullCode = this.code.join('');

    if (fullCode.length < 6) {
      alert('Introduce los 6 dígitos antes de continuar.');
      return;
    }

    if (fullCode === this.validCode) { // verificamos nosotros, no hace falta enviar a backend para verificar?? o hace falta verificar en front y backend
   /*   this.http.post('http://localhost:8081/api/verify-code/save', { fullCode: fullCode }) //envia el codigo de verificacion al endpoint de back y loc comprueban
    .subscribe({
      next: response => console.log('Respuesta del backend:', response),
      error: err => console.error('Error enviando dato:', err)
    }); solo activaremos la api si hace falta doble comprobar en front (ya esta), en back si lo enviamos  */
      
      this.router.navigate(['/confirmation']);
    } else {
      
      alert('Código incorrecto');
    }
  }

  goBack(): void {
    this.location.back();
  }
}
