import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-birth-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './birth-date.component.html',
  styleUrl: './birth-date.component.css'
})
export class BirthDateComponent {
  birthDate = null;
  @Output() birthDateChange = new EventEmitter<Date>();
}
