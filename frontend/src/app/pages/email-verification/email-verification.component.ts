import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent {
  // Array de 6 dígitos
  code: string[] = ['', '', '', '', '', ''];

  // Se ejecuta cuando se ingresa un dígito
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Limitar a un solo carácter
    if (value.length > 1) {
      input.value = value.charAt(0);
    }
    this.code[index] = input.value;

    // Saltar automáticamente al siguiente input
    if (value && index < this.code.length - 1) {
      const nextInput = document.getElementById(`digit-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  // Verificar el código al presionar el botón
  verifyCode(): void {
    const fullCode = this.code.join('');
    console.log('Código ingresado:', fullCode);
    // Aquí podrías añadir la lógica de verificación con tu backend
    alert(`Código ingresado: ${fullCode}`);
  }
}
