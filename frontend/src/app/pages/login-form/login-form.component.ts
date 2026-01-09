import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmailInputComponent } from '../../components/email-input/email-input.component';
import { PasswordInputComponent } from '../../components/password-input/password-input.component';
import { LoginRegisterButtonsComponent } from '../../components/login-register-buttons/login-register-buttons.component';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserLogin } from '../../models/user.models';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    EmailInputComponent,
    PasswordInputComponent,
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


    if (!this.email || !this.password) {
      this.showError = true;
      return;
    }

    const newUser: UserLogin = {
      email: this.email,
      password: this.password
    };

    this.authService.login(newUser).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
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
