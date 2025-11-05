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
    if (!this.location || this.validateLocation(this.location)) return this.setError('Debes introducir una ubicación válida');

    const personalData = {
      name: this.name,
      surname: this.surname,
      birthDate: this.birthDate,
      gender: this.gender,
      phone: this.phone,
      location: this.location,
      postalCode: this.postalCode
    };

    // Guardar datos en el servicio
    this.registerDataService.setRegisterData(personalData);

    // Recuperar token del servicio o localStorage
    let { token, email, username, password } = this.registerDataService.getRegisterData();
    if (!token) {
      token = localStorage.getItem('token') || '';
    }

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

  private validateName(name: string): boolean {
    const number = /[0-9]/;
    const special = /[!@#$%^&*?/]/;
    return name.length < 3 || name.length > 30 || number.test(name) || special.test(name);
  }

  private validateLocation(location: string): boolean {
    const number = /[0-9]/;
    const special = /[!@#$%^&*?]/;
    return location.length < 3 || location.length > 50 || number.test(location) || special.test(location);
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
    return d.getFullYear() > today.getFullYear() ||
           (d.getFullYear() === today.getFullYear() && d.getMonth() > today.getMonth()) ||
           (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() > today.getDate());
  }

  private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  private validatePhone(phone: number): boolean {
    const numString = phone.toString();
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const special = /[!@#$%^&*?/]/;
    return numString.length !== 9 || uppercase.test(numString) || lowercase.test(numString) || special.test(numString);
  }

  private validatePostal(postalCode: number): boolean {
    const numString = postalCode.toString();
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const special = /[!@#$%^&*?/]/;
    return numString.length !== 5 || uppercase.test(numString) || lowercase.test(numString) || special.test(numString);
  }
}
