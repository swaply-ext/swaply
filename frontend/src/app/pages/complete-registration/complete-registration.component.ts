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

  page = 1;
}
