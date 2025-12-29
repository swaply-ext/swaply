import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { NameInputComponent } from "../../components/name-input/name-input.component";
import { SurnameInputComponent } from "../../components/surname-input/surname-input.component";
import { BirthDateComponent } from "../../components/birth-date/birth-date.component";
import { PhoneInputComponent } from "../../components/phone-input/phone-input.component";
import { AddressInputComponent } from "../../components/address-input/address-input.component";
import { AccountService } from '../../services/account.service';
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
  birthDate!: Date;
  gender = '';
  location = '';
  phone = 0;
  postalCode = 0;

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
    this.birthDate = data.birthDate ? new Date(data.birthDate) : new Date();
    this.gender = data.gender || '';
    this.location = data.location || '';
    this.phone = data.phone || 0;
    this.postalCode = data.postalCode || 0;
  }

  registerData() {
    this.showError = false;

    if (typeof this.birthDate === 'string') {
      this.birthDate = new Date(this.birthDate);
    }

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

    this.accountService.personalInfo(allUserData)
      .subscribe({
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

    if (name.length < minLength) return true;
    if (name.length > maxLength) return true;
    if (!requirements.test(name)) return true;
    else return false;
  }

  private validateLocation(location: string): boolean {
    const minLength = 3;
    const maxLength = 50;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñçÇïÏ0-9\s,'ºª-]+$/;
    
    if (location.length < minLength) return true;
    if (location.length > maxLength) return true;
    if (!requirements.test(location)) return true;
    else return false;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private isFutureDate(date: Date): boolean {
    const today = new Date();
    return date > today;
  }

  private validatePhone(phone: number): boolean {
    const length = 9;
    const requirements = /^[0-9]+$/;;
    const numString = phone.toString();
    const startsCorrectly = /^[6789]/;

    if (numString.length != length) return true;
    if (!requirements.test(numString)) return true;
    if (!startsCorrectly.test(numString)) return true;
    else return false;
  }

  private validatePostal(postalCode: number): boolean {
    const length = 5;
    const requirements = /^[0-9]+$/;
    const numString = postalCode.toString();
    const min = 1001;
    const max = 52999;


    if (numString.length != length) return true;
    if (!requirements.test(numString)) return true;
    if (postalCode > max) return true;
    if (postalCode < min) return true;
    else return false;
  }
}
