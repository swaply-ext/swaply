import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NextButtonComponent } from '../../components/next-button/next-button.component'
import { NameInputComponent } from "../../components/name-input/name-input.component";
import { SurnameInputComponent } from "../../components/surname-input/surname-input.component";
import { BirthDateComponent } from "../../components/birth-date/birth-date.component";
import { PhoneInputComponent } from "../../components/phone-input/phone-input.component";
import { AddressInputComponent } from "../../components/address-input/address-input.component"

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
  accepted = false;

  constructor(private router: Router) { }

  submit() {
    if (!this.accepted) {
      alert('Debes aceptar los términos');
      return;
    }

    console.log('Registrando usuario...')

    this.router.navigateByUrl('/verify');
  }
}
