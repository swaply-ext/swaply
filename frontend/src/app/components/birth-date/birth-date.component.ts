import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-birth-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './birth-date.component.html',
  styleUrl: './birth-date.component.css'
})
export class BirthDateComponent implements OnInit {
  birthDate: string | null = null;
  @Input() hasError: boolean = false;
  @Output() birthDateChange = new EventEmitter<Date>();

  minDate: string = '1930-01-01';
  maxDate: string = '';
  
  errorMessage: string = '';

  ngOnInit() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    this.maxDate = `${year}-${month}-${day}`;
  }

  onDateChange(value: any) {
    this.errorMessage = ''; 
    this.hasError = false;

    if (value) {
      const inputDate = new Date(value);
      const selectedYear = inputDate.getFullYear();
      const today = new Date();

      if (selectedYear < 1930) {
        this.errorMessage = 'El año no puede ser anterior a 1930';
        this.hasError = true;
      } else if (inputDate > today) {
        this.errorMessage = 'La fecha no puede estar en el futuro';
        this.hasError = true;
      }
      
      this.birthDateChange.emit(inputDate);
    } else {
      this.birthDateChange.emit(null as any);
    }
  }
}