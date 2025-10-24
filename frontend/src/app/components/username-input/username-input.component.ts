import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-username-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './username-input.component.html',
  styleUrls: ['./username-input.component.css']
})
export class UsernameInputComponent {
  @Input() username = '';
  @Output() usernameChange = new EventEmitter<string>();

  @Input() hasError = false;
}
