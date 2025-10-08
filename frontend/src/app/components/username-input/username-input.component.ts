import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-username-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './username-input.component.html',
  styleUrl: './username-input.component.css'
})
export class UsernameInputComponent {
  username = '';
  @Output() usernameChange = new EventEmitter<string>();
}
