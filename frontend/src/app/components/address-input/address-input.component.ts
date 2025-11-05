import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-address-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-input.component.html',
  styleUrl: './address-input.component.css'
})
export class AddressInputComponent {
  address = '';
  postalCode = null;
  @Input() hasError: boolean = false;
  @Output() addressChange = new EventEmitter<string>();
  @Output() postalChange = new EventEmitter<number>();
}
