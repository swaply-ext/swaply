import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NextButtonComponent } from '../../components/next-button/next-button.component'
import { NameInputComponent } from "../../components/name-input/name-input.component";
import { SurnameInputComponent } from "../../components/surname-input/surname-input.component";
import { BirthDateComponent } from "../../components/birth-date/birth-date.component";
import { PhoneInputComponent } from "../../components/phone-input/phone-input.component";
import { AddressInputComponent } from "../../components/address-input/address-input.component"


interface UserData {
  name: string;
  surname: string;
  birthDate: Date;
  phone: number;
  adress: string;
  cp: number;
}


@Component({
  selector: 'app-personal-information',
  imports: [
    NextButtonComponent,
    NameInputComponent,
    SurnameInputComponent,
    BirthDateComponent,
    PhoneInputComponent,
    AddressInputComponent
],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.css'
})

export class PersonalInformationComponent {
  name = '';
  surname = '';
  birthDate = new Date();
  address = '';
  phone = 0;
  cp = 0;

   // Array local para guardar usuarios registrados
  registeredUsers: UserData[] = [];

  constructor(private router: Router) {}

   registerData() {
    if (!this.name) { alert('Debes introducir un nombre válido'); return; }
    if (!this.surname) { alert('Debes introducir un apellido válido'); return; }
    if (!this.birthDate) { alert('Debes introducir una fecha de nacimiento válida'); return; }
    if (!this.phone) { alert('Debes introducir un número de teléfono válido'); return; }
    if (!this.address) { alert('Debes introducir una dirección válida'); return; }
    if (!this.cp) { alert('Debes introducir un código postal válido'); return; }


    const newUserData: UserData = {
      name: this.name,
      surname: this.surname,
      birthDate: this.birthDate,
      phone: this.phone,
      adress: this.address,
      cp: this.cp,
    };


    // Guardar usuario localmente
    this.registeredUsers.push(newUserData);
    console.log('Datos de usuarios registrados:', this.registeredUsers);


    this.router.navigateByUrl('/verify');
  }
}
