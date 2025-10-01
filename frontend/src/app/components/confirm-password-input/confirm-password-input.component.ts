import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./confirm-password-input.component.css'],
  template: `
    <div class="input-container">
      <input type="password"
             [(ngModel)]="confirmPassword"
             (ngModelChange)="confirmPasswordChange.emit($event)"
             placeholder="Confirmar Contraseña">
      <span class="material-icons">lock</span>
    </div>
  `
})
export class ConfirmPasswordInputComponent {
  confirmPassword = '';
  @Output() confirmPasswordChange = new EventEmitter<string>();
}
