import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  phone: number = null!;
  @Input() hasError: boolean = false; 
  @Output() phoneChange = new EventEmitter<number>();
}
