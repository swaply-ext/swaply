import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { TermsCheckboxComponent } from '../../components/terms-checkbox/terms-checkbox.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface User {
  email: string;
  password: string;
}

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    PasswordInputComponent,
    TermsCheckboxComponent,
    RouterLink,
    LoginRegisterButtonsComponent,
    CommonModule
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})

export class LoginFormComponent {
  email = '';
  password = '';
  accepted = false;
  showError = false;
  private authService = inject(AuthService);

  constructor(private router: Router, private http: HttpClient) { }

  login() {

    this.showError = false;
    this.email = this.email.toLowerCase();

    if (!this.accepted) {
      this.showError = true;
      return;
    }
    if (!this.email || !this.password) {
      this.showError = true;
      return;
    }

    const newUser: User = {
      email: this.email,
      password: this.password
    };

    this.authService.login(newUser).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (err.status == 401) {
          this.router.navigate(['/error-auth']);
        } else {
          this.router.navigate(['/error-auth']);
        }
      }
    });
  }

  register() {
    this.router.navigate(['/register']);
  }
}
