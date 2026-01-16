import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  birthDate: Date = new Date();
  @Input() hasError: boolean = false;
  @Output() birthDateChange = new EventEmitter<Date>();
}
