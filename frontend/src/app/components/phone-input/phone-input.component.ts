import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.css'
})
export class PhoneInputComponent {
  phone = null;
  @Output() phoneChange = new EventEmitter<number>();
}
