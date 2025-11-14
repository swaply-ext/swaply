import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RegisterDataService } from '../../services/register-data.service';
import { AuthGuard } from '../../services/auth-guard.service';
import { Token } from '@angular/compiler';
@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})


export class EmailVerificationComponent implements OnInit {
  code: string[] = ['', '', '', '', '', ''];
  showError = false;
  email: string = '';
  message = '';

  constructor(
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private registerDataService: RegisterDataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Recupera email del servei
    const data = this.registerDataService.getRegisterData();
    this.email = data.email || '';

    if (!this.email) {
      console.error('No email found in service');
      this.router.navigate(['/register']);
      return;
    }
    console.log('Email recuperado del servicio:', this.email);
  }

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


  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    // Obtiene el texto del portapapeles y lo convierte en array de dígitos
    const pasteCode = event.clipboardData?.getData('text') || '';
    const digits = pasteCode.replace(/\D/g, '').slice(0, 6).split('');
    // Asigna cada dígito a su campo correspondiente
    digits.forEach((digit, i) => {
      const input = document.getElementById(`code-${i}`) as HTMLInputElement;
      if (input) {
        input.value = digit;
        this.code[i] = digit;
      }
    });
    // Enfoca el siguiente campo disponible
    const nextIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.getElementById(`code-${nextIndex}`) as HTMLInputElement;
    nextInput?.focus();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  verifyCode() {
    const fullCode = this.code.join('');

    if (fullCode.length < 6) {
      this.showError = true;
      this.message = 'Debes introducir un código válido';
      return;
    }


    const verifyData = {
      email: this.email,
      code: fullCode
    };

    console.log('Enviando verificación:', verifyData);
    this.http.post('http://localhost:8081/api/auth/registerCodeVerify', verifyData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
  if (response) {
    // Guardar token en el servicio
    this.registerDataService.setRegisterData({ token: response });

    // Guardar token en localStorage con la misma clave que usa el interceptor
    this.authService.autenticateUser(response);

    // Redirigir al usuario
    this.router.navigate(['/confirmation']);
  } else {
    this.showError = true;
    this.message = 'Error de servidor. Inténtalo más tarde.';
  }
        },
        error: (error) => {
          console.error('Error en la verificación:', error);
          if (error.status === 401) {
            this.showError = true;
            this.message = 'Código de verificación incorrecto'
          } else {
            this.showError = true;
            this.message = 'Error de servidor. Inténtalo más tarde.';
            this.router.navigate(['/error']);
          }
        }
      });
  }

  goBack(): void {
    this.location.back();
  }
}
