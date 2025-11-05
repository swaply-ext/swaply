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

//recibimos la info de email and password guardamos el objeto userInfo {}

export class PersonalInformationComponent {
  // Propiedades que almacenan el estado del formulario
  previousData: any = {};
  name = '';
  surname = '';
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

    if (!this.address || this.validateLocation(this.address)) {
      this.showError = true;
      this.hasErrorAll = true;
      this.message = 'Debes introducir una dirección válida';
      return;
    }

    // Crea el objeto con los nuevos datos del usuario
    const newUserData = {
      name: this.name,
      surname: this.surname,
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
    //RUTA DE API INCORRECTA, CAMBIAR CUANDO EL ENDPOINT ESTÉ TERMINADO
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
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;

    if (name.length < minLength) return true;
    if (name.length > maxLength) return true;
    if (!requirements.test(name)) return true;
    else return false;
  }

  private validateLocation(location: string): boolean {
    const minLength = 3;
    const maxLength = 50;
    const requirements = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s,'ºª-]+$/;

    if (location.length < minLength) return true;
    if (location.length > maxLength) return true;
    if (!requirements.test(location)) return true;
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
