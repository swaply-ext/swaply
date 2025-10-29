// ...existing code...
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RecoveryDataService } from '../../services/recovery-data.service.service';

@Component({
  selector: 'app-pass-verification',
  standalone: true,
  imports: [],
  templateUrl: './pass-verification.component.html',
  styleUrls: ['./pass-verification.component.css']
})
export class PassVerificationComponent implements OnInit {
  code: string[] = ['', '', '', '', '', ''];
  expectedCode?: string;
  recoveryObject = { id: '', email: '' };

  constructor(
    private location: Location,
    private router: Router,
    private recoveryService: RecoveryDataService
  ) {}

  ngOnInit() {
    const data = this.recoveryService.getRecoveryData();
    this.expectedCode = data.code;
    this.recoveryObject.id = data.id ?? '';
    this.recoveryObject.email = data.email ?? '';
    console.log('Esperat code:', this.expectedCode, 'recoveryObject:', this.recoveryObject);
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

    if (fullCode === this.expectedCode) {
      // Codi correcte → ja tenim id al servei. Anem a new-password
      this.router.navigate(['/new-password']);
    } else {
      alert('Código incorrecto');
    }
  }

  goBack(): void {
    this.location.back();
  }
}