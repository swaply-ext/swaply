import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./password-input.component.css'],
  templateUrl: './password-input.component.html'
})
export class PasswordInputComponent {
  password = '';
  @Output() passwordChange = new EventEmitter<string>();
}



