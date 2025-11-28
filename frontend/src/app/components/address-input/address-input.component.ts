import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-input', 
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.css'] 
})
export class AddressInputComponent {
  location = '';          
  postalCode: number = 0; 
  @Input() hasError: boolean = false;
  @Output() locationChange = new EventEmitter<string>(); 
  @Output() postalChange = new EventEmitter<number>();
}
