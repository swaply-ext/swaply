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
import { ValidateInputsService } from '../../services/validate-inputs.service'; 
import { AlertService } from '../../services/alert.service';

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
    private registerDataService: RegisterDataService,
    private validateInputsService: ValidateInputsService,
    private alertService: AlertService
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

    if (this.birthDate && typeof this.birthDate === 'string') {
      this.birthDate = new Date(this.birthDate);
    }

    // --- USAMOS EL SERVICIO PARA LAS VALIDACIONES ---
    
    if (!this.name || this.name.trim() === '') return this.setError('Debes introducir un nombre.');
    if (!this.validateInputsService.isNameValid(this.name)) return this.setError('El nombre no tiene un formato válido.');

    if (!this.surname || this.surname.trim() === '') return this.setError('Debes introducir un apellido.');
    if (!this.validateInputsService.isSurnameValid(this.surname)) return this.setError('El apellido no tiene un formato válido.');

    if (!this.birthDate || isNaN(this.birthDate.getTime())) return this.setError('Debes introducir una fecha de nacimiento válida.');
    
    // Le pasamos la fecha al servicio como string en formato ISO
    const dateValidation = this.validateInputsService.validateBirthDate(this.birthDate.toISOString());
    if (!dateValidation.isValid) {
      return this.setError(dateValidation.message); // Usamos el mensaje del propio servicio
    }

    if (!this.gender || this.gender.trim() === '') return this.setError('Debes seleccionar un género.');

    if (!this.phone || this.phone === 0) return this.setError('Debes introducir un número de teléfono.');
    if (!this.validateInputsService.isPhoneValid(this.phone)) return this.setError('El número de teléfono no es válido.');

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
          this.alertService.show('success', 'generic', { msg: 'Información guardada correctamente.' });
          this.router.navigate(['/skills']);
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

  onLocationSelected(newLocation: Location | null): void {
    this.location = newLocation;
    console.log('Ubicación seleccionada capturada:', this.location);
  }
}