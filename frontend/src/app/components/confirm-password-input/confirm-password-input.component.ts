import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-password-input.component.html',
  styleUrls: ['./confirm-password-input.component.css']
})
export class ConfirmPasswordInputComponent {
  @Input() confirmPassword = '';
  @Input() hasError = false;
  @Output() confirmPasswordChange = new EventEmitter<string>();

  showPassword: boolean = false;

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.confirmPasswordChange.emit(value);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}