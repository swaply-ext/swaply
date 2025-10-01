import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./email-input.component.css'],
  template: `
    <div class="input-container">
      <input 
        type="email" 
        [(ngModel)]="email" 
        (ngModelChange)="emailChange.emit($event)" 
        placeholder="Email"
      >
      <span class="material-icons">email</span>
    </div>
  `
})
export class EmailInputComponent {
  email = '';
  @Output() emailChange = new EventEmitter<string>();
}
