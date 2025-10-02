import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-confirm-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./confirm-password-input.component.css'],
  templateUrl: './confirm-password-input.component.html'
})
export class ConfirmPasswordInputComponent {
  confirmPassword = '';
  @Output() confirmPasswordChange = new EventEmitter<string>();
}



