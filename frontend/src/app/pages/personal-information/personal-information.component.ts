import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { NameInputComponent } from "../../components/name-input/name-input.component";
import { SurnameInputComponent } from "../../components/surname-input/surname-input.component";
import { BirthDateComponent } from "../../components/birth-date/birth-date.component";
import { PhoneInputComponent } from "../../components/phone-input/phone-input.component";
import { AccountService } from '../../services/account.service';
import { RegisterDataService } from '../../services/register-data.service';
import { GenderInputComponent } from '../../components/gender-input/gender-input.component';
import { LocationSearchComponent } from '../../components/location-search/location-search.component';
import { NgIf } from '@angular/common';

interface Location {
  placeId: string;
  lat: number;
  lon: number;
  displayName: string;
}

@Component({
  selector: 'app-personal-information',
  imports: [
    NextButtonComponent,
    NameInputComponent,
    SurnameInputComponent,
    BirthDateComponent,
    GenderInputComponent,
    PhoneInputComponent,
    NgIf,
    LocationSearchComponent
  ],
  standalone: true,
  styleUrls: ['./personal-information.component.css'],
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent implements OnInit {

  name = '';
  surname = '';
  birthDate: Date | null = null;
  gender = '';
  location: Location | null = null;
  phone = 0;

  showError = false;
  hasErrorAll = false;
  message = '';

  constructor(
    private router: Router,
    private accountService: AccountService,
    private registerDataService: RegisterDataService
  ) { }

  ngOnInit() {
    const data = this.registerDataService.getRegisterData();

    this.name = data.name || '';
    this.surname = data.surname || '';
    this.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    this.gender = data.gender || '';
    this.location = data.location as Location | null;
    this.phone = data.phone || 0;
  }

  registerData() {
    this.showError = false;

    // Asegurarnos de que si hay fecha como string, la pasamos a objeto Date
    if (this.birthDate && typeof this.birthDate === 'string') {
      this.birthDate = new Date(this.birthDate);
    }

    // --- VALIDACIONES ESTRICTAS ---
    if (!this.name || this.name.trim() === '') return this.setError('Debes introducir un nombre.');
    if (this.validateName(this.name)) return this.setError('El nombre no tiene un formato válido.');

    if (!this.surname || this.surname.trim() === '') return this.setError('Debes introducir un apellido.');
    if (this.validateName(this.surname)) return this.setError('El apellido no tiene un formato válido.');

    // Aquí evitamos que pasen si birthDate es null o "Invalid Date"
    if (!this.birthDate || isNaN(this.birthDate.getTime())) return this.setError('Debes introducir una fecha de nacimiento válida.');
    if (this.isFutureDate(this.birthDate) || this.isToday(this.birthDate)) return this.setError('La fecha de nacimiento no puede ser hoy ni en el futuro.');

    const userAge = this.calculateAge(this.birthDate);
    if (userAge < 18) {
      return this.setError('Debes tener al menos 18 años para registrarte en Swaply.');
    } 
    if (userAge > 120) {
      return this.setError('Por favor, introduce una fecha de nacimiento real.');
    }

    if (!this.gender || this.gender.trim() === '') return this.setError('Debes seleccionar un género.');

    if (!this.phone || this.phone === 0) return this.setError('Debes introducir un número de teléfono.');
    if (this.validatePhone(this.phone)) return this.setError('El número de teléfono no es válido.');

    if (!this.location || !this.location.displayName) return this.setError('Debes seleccionar una ubicación de la lista.');

    const personalData = {
      name: this.name,
      surname: this.surname,
      birthDate: this.birthDate,
      gender: this.gender,
      phone: this.phone,
      location: this.location,
    };

    this.registerDataService.setRegisterData(personalData);

    let { token, email, username, password } = this.registerDataService.getRegisterData();
    if (!token) token = localStorage.getItem('authToken') || '';

    if (!token) {
      console.log(localStorage.getItem('authToken'));
      this.setError('No se ha verificado el email. Regresa al registro.');
      return;
    }

    const allUserData = { email, username, password, ...personalData };

    this.registerDataService.personalInformation(allUserData).subscribe({
      next: (success) => {
        if (success) {
          console.log('Información personal añadida con éxito.');
          this.router.navigate(['/select-avatar']);
        }
      },
      error: (err) => {
        console.error('Error al añadir información personal:', err.message);
        this.setError(err.message);
      }
    });
  }

  private setError(msg: string) {
    this.showError = true;
    this.hasErrorAll = true;
    this.message = msg;
  }

  // --- VALIDACIONES MEJORADAS ---

  private validateName(name: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;

    if (name.length < minLength) return true;
    if (name.length > maxLength) return true;
    if (!requirements.test(name)) return true;
    return false;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Si aun no a cumplido la edad minima necesaria le restamos un año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private isFutureDate(date: Date): boolean {
    const today = new Date();
    // Ponemos la hora de hoy a cero para que compare solo días
    today.setHours(0, 0, 0, 0); 
    return date > today;
  }

  private validatePhone(phone: number): boolean {
    const numString = phone.toString();
    const length = 9;
    const requirements = /^[0-9]+$/;
    const startsCorrectly = /^[6789]/;

    if (numString.length !== length) return true;
    if (!requirements.test(numString)) return true;
    if (!startsCorrectly.test(numString)) return true;
    return false;
  }

  onLocationSelected(newLocation: Location | null): void {
    this.location = newLocation;
    console.log('Ubicación seleccionada capturada:', this.location);
  }
}