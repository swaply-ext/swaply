import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NextButtonComponent } from '../../components/next-button/next-button.component';
import { NameInputComponent } from "../../components/name-input/name-input.component";
import { SurnameInputComponent } from "../../components/surname-input/surname-input.component";
import { BirthDateComponent } from "../../components/birth-date/birth-date.component";
import { PhoneInputComponent } from "../../components/phone-input/phone-input.component";
import { AddressInputComponent } from "../../components/address-input/address-input.component";
import { UsernameInputComponent } from "../../components/username-input/username-input.component";
import { HttpClient } from '@angular/common/http';
import { RegisterDataService } from '../../services/register-data.service';
import { GenderInputComponent } from '../../components/gender-input/gender-input.component';
import { CommonModule } from '@angular/common';

interface UserData {
  name: string;
  surname: string;
  username: string;
  birthDate: Date;
  gender: string;
  phone: number;
  adress: string;
  postalCode: number;
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
    AddressInputComponent,
    UsernameInputComponent,
    CommonModule
  ],
  standalone: true,
  styleUrls: ['./personal-information.component.css'],
  templateUrl: './personal-information.component.html',
})

//recibimos la info de email and password guardamos el objeto userInfo {}

export class PersonalInformationComponent {
  // Propiedades que almacenan el estado del formulario
  previousData: any = {};
  name = '';
  surname = '';
  username = '';
  birthDate: Date | undefined;
  gender = '';
  address = '';
  phone = 0;
  postalCode = 0;
  showError = false;
  hasErrorAll = false;
  message = '';

  // Constructor con inyección de dependencias
  constructor(
    private router: Router,
    private http: HttpClient,
    private registerDataService: RegisterDataService
  ) { }
  // Al inicializar el componente, recupera los datos previos del servicio
  ngOnInit() {
    this.previousData = this.registerDataService.getRegisterData();
    console.log('Datos previos recibidos:', this.previousData);
  }
  // Función para manejar el envío del formulario
  registerData() {
    this.showError = false;

    if (!this.name || this.validateName(this.name)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir un nombre válido';
      return;
    }

    if (!this.surname || this.validateName(this.surname)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir un apellido válido';
      return;
    }

    if (!this.username || this.validateUsername(this.username)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir un nombre de usuario válido';
      return;
    }

    if (!this.birthDate || (new Date(this.birthDate) > new Date()) || this.isToday(new Date(this.birthDate))) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir una fecha de nacimiento válida';
      return;
    }

    if (!this.gender) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes seleccionar un género';
      return;
    }

    if (!this.phone || this.validatePhone(this.phone)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir un número de teléfono válido';
      return;
    }

    if (!this.postalCode || this.validatePostal(this.postalCode)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir un código postal válido';
      return;
    }

    if (!this.address || this.validateAddress(this.address)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir una dirección válida';
      return;
    }

    // Crea el objeto con los nuevos datos del usuario
    const newUserData = {
      name: this.name,
      surname: this.surname,
      username: this.username,
      birthDate: this.birthDate,
      gender: this.gender,
      phone: this.phone,
      adress: this.address,
      postalCode: this.postalCode
    };
    // Combina los datos previos con los nuevos
    this.registerDataService.setRegisterData(newUserData);
    // Recupera todos los datos del usuario desde el servicio
    const allData = this.registerDataService.getRegisterData();
    this.http.post<{ code: string }>('http://localhost:8081/api/auth/mailVerify', allData.email)
      .subscribe({
        next: response => {
          // Guarda el codi de verificació rebut
          console.log("response: " + response);

          this.router.navigate(['/verify'], { state: { code: response } });


          // Ara tens al servei: email, password, dades personals i verifyCode
          // Pots navegar a la pàgina de verificació
        },
        error: err => console.error('Error enviando datos:', err)
      });


  }
  //Restricciones de los campos
  private validateName(name: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const number = /[0-9]/;
    const special = /[!@#$%^&*?/]/;

    if (name.length < minLength) return true;
    if (name.length > maxLength) return true;
    if (number.test(name)) return true;
    if (special.test(name)) return true;
    else return false;
  }

  private validateAddress(address: string): boolean {
    const minLength = 3;
    const maxLength = 50;
    const number = /[0-9]/;
    const special = /[!@#$%^&*?]/;

    if (address.length < minLength) return true;
    if (address.length > maxLength) return true;
    if (number.test(address)) return true;
    if (special.test(address)) return true;
    else return false;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private validatePhone(phone: number): boolean {
    const length = 9;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const special = /[!@#$%^&*?/]/;
    const numString = phone.toString();

    if (numString.length != length) return true;
    if (uppercase.test(numString)) return true;
    if (lowercase.test(numString)) return true;
    if (special.test(numString)) return true;
    else return false;
  }

  private validatePostal(postalCode: number): boolean {
    const length = 5;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const special = /[!@#$%^&*?/]/;
    const numString = postalCode.toString();

    if (numString.length != length) return true;
    if (uppercase.test(numString)) return true;
    if (lowercase.test(numString)) return true;
    if (special.test(numString)) return true;
    else return false;
  }

  private validateUsername(username: string): boolean {
    const minLength = 3;
    const maxLength = 30;
    const special = /[!@#$%^&*?/]/;

    if (username.length < minLength) return true;
    if (username.length > maxLength) return true;
    if (special.test(username)) return true;
    else return false;
  }
}
