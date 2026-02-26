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

  minDate: string = '';
  maxDate: string = '';
  
  errorMessage: string = '';
  minYear: number = 0;
  maxYear: number = 0;

  ngOnInit() {
    const today = new Date();
    
    this.maxYear = today.getFullYear() - 18; 
    this.minYear = today.getFullYear() - 120; 

    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    // Asignamos los límites para que el calendario HTML bloquee el resto de fechas
    this.maxDate = `${this.maxYear}-${month}-${day}`;
    this.minDate = `${this.minYear}-${month}-${day}`;
  }

  onDateChange(value: any) {
    this.errorMessage = ''; 
    this.hasError = false;

    if (value) {
      const inputDate = new Date(value);
      const selectedYear = inputDate.getFullYear();

      // Validamos inmediatamente cuando el usuario cambia la fecha
      if (selectedYear < this.minYear) {
        this.errorMessage = `Por favor, introduce una fecha de nacimiento correcta.`;
        this.hasError = true;
      } else if (inputDate > new Date(this.maxDate)) {
        this.errorMessage = 'Debes tener al menos 18 años para registrarte';
        this.hasError = true;
      }
    
      this.birthDateChange.emit(inputDate);
    } else {
      this.birthDateChange.emit(null as any);
    }
  }
}