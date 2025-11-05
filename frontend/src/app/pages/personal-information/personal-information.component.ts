import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { NameInputComponent } from "../../components/name-input/name-input.component";
import { SurnameInputComponent } from "../../components/surname-input/surname-input.component";
import { BirthDateComponent } from "../../components/birth-date/birth-date.component";
import { PhoneInputComponent } from "../../components/phone-input/phone-input.component";
import { AddressInputComponent } from "../../components/address-input/address-input.component";
import { HttpClient } from '@angular/common/http';
import { RegisterDataService } from '../../services/register-data.service';
import { GenderInputComponent } from '../../components/gender-input/gender-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-information',
  imports: [
    NextButtonComponent,
    NameInputComponent,
    SurnameInputComponent,
    BirthDateComponent,
    GenderInputComponent,
    PhoneInputComponent,
    AddressInputComponent,
    CommonModule
  ],
  standalone: true,
  styleUrls: ['./personal-information.component.css'],
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent {
  name = '';
  surname = '';
  birthDate: Date | undefined;
  gender = '';
  location = '';
  phone = 0;
  postalCode = 0;

  showError = false;
  hasErrorAll = false;
  message = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private registerDataService: RegisterDataService
  ) { }

  ngOnInit() {
    const data = this.registerDataService.getRegisterData();

    this.name = data.name || '';
    this.surname = data.surname || '';
    this.birthDate = data.birthDate ? new Date(data.birthDate) : undefined;
    this.gender = data.gender || '';
    this.location = data.location || '';
    this.phone = data.phone || 0;
    this.postalCode = data.postalCode || 0;
  }

  registerData() {
    this.showError = false;

    if (!this.name || this.validateName(this.name)) return this.setError('Debes introducir un nombre válido');
    if (!this.surname || this.validateName(this.surname)) return this.setError('Debes introducir un apellido válido');
    if (!this.birthDate || this.isFutureDate(this.birthDate) || this.isToday(this.birthDate)) return this.setError('Debes introducir una fecha de nacimiento válida');
    if (!this.gender) return this.setError('Debes seleccionar un género');
    if (!this.phone || this.validatePhone(this.phone)) return this.setError('Debes introducir un número de teléfono válido');
    if (!this.postalCode || this.validatePostal(this.postalCode)) return this.setError('Debes introducir un código postal válido');
    if (!this.location || this.validateLocation(this.location)) return this.setError('Debes introducir una dirección válida');

    const personalData = {
      name: this.name,
      surname: this.surname,
      birthDate: this.birthDate,
      gender: this.gender,
      phone: this.phone,
      location: this.location,
      postalCode: this.postalCode
    };

    this.registerDataService.setRegisterData(personalData);

    let { token, email, username, password } = this.registerDataService.getRegisterData();
    if (!token) token = localStorage.getItem('token') || '';

    if (!token) {
      this.setError('No se ha verificado el email. Regresa al registro.');
      return;
    }

    const allUserData = { email, username, password, ...personalData };

    this.http.post('http://localhost:8081/api/account/personalInfo', allUserData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log('Registro completo:', allUserData);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error al actualizar información:', err);
        this.setError('Error al actualizar información. Inténtalo más tarde.');
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
    return name.length < minLength || name.length > maxLength || !requirements.test(name);
  }

  private validateLocation(location: string): boolean {
    const minLength = 3;
    const maxLength = 50;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s,'ºª-]+$/;
    return location.length < minLength || location.length > maxLength || !requirements.test(location);
  }

  private isToday(date: Date | string): boolean {
    const d = date instanceof Date ? date : this.parseDateString(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }

  private isFutureDate(date: Date | string): boolean {
    const d = date instanceof Date ? date : this.parseDateString(date);
    const today = new Date();
    return d > today;
  }

  private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private validatePhone(phone: number): boolean {
    const numString = phone.toString();
    const requirements = /^[0-9]+$/;
    const startsCorrectly = /^[6789]/;
    return numString.length !== 9 || !requirements.test(numString) || !startsCorrectly.test(numString);
  }

  private validatePostal(postalCode: number): boolean {
    const numString = postalCode.toString();
    const requirements = /^[0-9]+$/;
    const min = 1001;
    const max = 52999;
    return numString.length !== 5 || !requirements.test(numString) || postalCode < min || postalCode > max;
  }
}
