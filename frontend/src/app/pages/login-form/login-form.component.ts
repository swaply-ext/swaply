
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginButtonComponent } from '../../components/login-button/login-button.component';
import { RouterLink } from '@angular/router';


interface User {
  email: string;
  password: string;
  acceptedTerms: boolean;
}


@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    PasswordInputComponent,
    TermsCheckboxComponent,
    LoginButtonComponent,
    RouterLink
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  email = '';
  password = '';
  accepted = false;


  registeredUsers: User[] = [
    { email: 'test@example.com', password: '123456', acceptedTerms: true }
  ];
//o
 //.
  constructor(private router: Router) {}


  login() {
    if (!this.accepted) { alert('Debes aceptar los términos'); return; }
    if (!this.email || !this.password) { alert('Debes rellenar todos los campos'); return; }


    const foundUser = this.registeredUsers.find(
      user => user.email === this.email && user.password === this.password
    );


    if (!foundUser) {
      alert('Usuario o contraseña incorrectos');
      return;
    }


    console.log('Usuario logueado:', foundUser);
    this.router.navigate(['/verify']);
  }
}
