import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterFormComponent } from "../register-form/register-form.component";
import { PersonalInformationComponent } from "../personal-information/personal-information.component";
import { EmailVerificationComponent } from "../email-verification/email-verification.component";
import { ErrorAuthComponent } from '../error-auth/error-auth.component';

@Component({
  selector: 'app-complete-registration',
  imports: [ RegisterFormComponent,  PersonalInformationComponent, EmailVerificationComponent,  CommonModule, ErrorAuthComponent],
  templateUrl: './complete-registration.component.html',
  styleUrl: './complete-registration.component.css'
})
export class CompleteRegistrationComponent {

  page = 2;
  email = '';
  password = '';
  name = '';
  surname = '';
  username = '';
  birthDate: Date | undefined;
  address = '';
  phone = 0;
  postalCode = 0;





  saveData(data: any){
    this.email= data.email;
    this.password= data.password;
    this.page=2;
    console.log(this.password);
  }

   savePersonal(data: any){
    this.name = data.name;
    this.surname = data.surname;
    this.username = data.username;
    this.birthDate= data.birthDate;
    this.address = data.address;
    this.phone = data.phone;
    this.postalCode = data.postalCode;
    this.page=3;
    console.log(this.password);
  }

}
