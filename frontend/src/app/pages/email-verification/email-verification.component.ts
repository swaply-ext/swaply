import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent {
  
  code: string[] = ['', '', '', '', '', ''];

  private readonly validCode = '131313';

  constructor(private location: Location, private router: Router) {}

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

    if (fullCode === this.validCode) {
      alert('Código correcto, acceso permitido');
      this.router.navigate(['/']); 
    } else {
      alert('Código incorrecto');
    }
  }

  goBack(): void {
    this.location.back();
  }
}
