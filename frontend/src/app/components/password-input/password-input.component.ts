import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./password-input.component.css'],
  template: `
    <div class="input-container">
      <input type="password"
             [(ngModel)]="password"
             (ngModelChange)="passwordChange.emit($event)"
             placeholder="Contraseña">
      <span class="material-icons">lock</span>
    </div>
  `
})
export class PasswordInputComponent {
  password = '';
  @Output() passwordChange = new EventEmitter<string>();
}
