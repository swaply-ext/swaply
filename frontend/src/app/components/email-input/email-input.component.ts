import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./email-input.component.css'],
  templateUrl: './email-input.component.html'
})
export class EmailInputComponent {
  email = '';
  @Output() emailChange = new EventEmitter<string>();
}


