import { Component } from '@angular/core';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-privacy-and-security',
  imports: [ 
    AppNavbarComponent,
    SideMenuComponent,
    CommonModule,
    FormsModule
    ],
  standalone: true,
  templateUrl: './privacy-and-security.component.html',
  styleUrls: ['./privacy-and-security.component.css']
})

export class PrivacyAndSecurityComponent {

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  showCurrent: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;

  showError: boolean = false;
  message: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Password visibility
  toggleVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') this.showCurrent = !this.showCurrent;
    else if (field === 'new') this.showNew = !this.showNew;
    else if (field === 'confirm') this.showConfirm = !this.showConfirm;
  }


  // VERIFY CURRENT PASSWORD??????

  // Validate password 
  private validatePassword(password: string): { valid: boolean; message: string } {
    const minLength = 8;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*?]/;
    const simpleSeq = /(1234|abcd|password|qwerty)/i;

    if (password.length < minLength) return { valid: false, message: `Debe tener al menos ${minLength} caracteres.` };
    if (!uppercase.test(password)) return { valid: false, message: 'Debe contener al menos una letra mayúscula.' };
    if (!lowercase.test(password)) return { valid: false, message: 'Debe contener al menos una letra minúscula.' };
    if (!number.test(password)) return { valid: false, message: 'Debe contener al menos un número.' };
    if (!special.test(password)) return { valid: false, message: 'Debe contener al menos un carácter especial (!@#$%^&*?).' };
    if (simpleSeq.test(password)) return { valid: false, message: 'No use secuencias simples o información personal.' };

    return { valid: true, message: '' };
  }

// Live validation for NEW password
  onNewPasswordChange(value: string) {
    this.newPassword = value;

    const validation = this.validatePassword(this.newPassword);

    if (!validation.valid) {
      this.showError = true;
      this.message = 'Contraseña inválida: ' + validation.message;
    } else {
      this.showError = false;
      this.message = '';
    }
  }


  // Submit form
  submitNewPassword() {
    this.showError = false;

    // Check all fields are filled
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.showError = true;
      this.message = 'Debes rellenar todos los campos';
      return;
    }

    // Validate new password
    const passwordValidation = this.validatePassword(this.newPassword);
    if (!passwordValidation.valid) {
      this.showError = true;
      this.message = 'Contraseña inválida:\n' + passwordValidation.message;
      return;
    }
    

    // Confirm passwords match
    if (this.newPassword !== this.confirmPassword) {
      this.showError = true;
      this.message = 'Las contraseñas deben coincidir';
      return;
    }

    // Prepare payload
    const payload = {
      password: this.currentPassword,
      newPassword: this.newPassword
    };

    // Call backend API 
    this.http.post('http://localhost:8081/api/auth/passwordChange', payload, { observe: 'response' })
      .subscribe({
        next: response => {
          if (response.status === 200) {
            this.showError = false;
            alert('Contraseña cambiada correctamente');
            this.router.navigate(['/']); // redirect 
          } else {
            this.showError = true;
            this.message = 'Error cambiando la contraseña';
          }
        },
        error: err => {
          console.error('Error al cambiar contraseña:', err);
          this.showError = true;
          if (err.status === 400 && err.error?.message) {
            this.message = err.error.message; // backend message
          } else {
            this.message = 'Error de servidor. Inténtalo de nuevo más tarde';
          }
          
        }
        
      });     
  }
}
