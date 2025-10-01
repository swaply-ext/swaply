import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-email-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./confirm-email-input.component.css'],
  template: `
    <div class="input-container">
      <input type="email"
             [(ngModel)]="confirmEmail"
             (ngModelChange)="confirmEmailChange.emit($event)"
             placeholder="Confirmar Email">
      <span class="material-icons">email</span>
    </div>
  `
})
export class ConfirmEmailInputComponent {
  confirmEmail = '';
  @Output() confirmEmailChange = new EventEmitter<string>();
}
