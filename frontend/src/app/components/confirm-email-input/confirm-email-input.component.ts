import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-confirm-email-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./confirm-email-input.component.css'],
  templateUrl: './confirm-email-input.component.html'
})
export class ConfirmEmailInputComponent {
  confirmEmail = '';
  @Output() confirmEmailChange = new EventEmitter<string>();
}


