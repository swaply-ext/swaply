import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent {
  code: string[] = ['', '', '', '', '', ''];

  constructor(private location: Location) {}

  // Al escribir un dígito
  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // solo números
    input.value = value; // limitar a 1 carácter
    this.code[index] = value;

    if (value && index < 5) {
      const next = document.getElementById(`code-${index+1}`) as HTMLInputElement;
      next?.focus();
    }
  }

  // Al presionar Backspace
  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`code-${index-1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  verifyCode(): void {
    const fullCode = this.code.join('');
    if (fullCode.length < 6) {
      alert('Introduce los 6 dígitos antes de continuar.');
      return;
    }
    alert(`Código ingresado: ${fullCode}`);
  }

  goBack(): void {
    this.location.back();
  }
}
