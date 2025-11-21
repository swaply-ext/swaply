import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RecoveryDataService } from '../../services/recovery-data.service.service';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recovery-password.component.html',
  styleUrls: ['./recovery-password.component.css']
})
export class RecoveryPasswordComponent {
  email: string = '';
  showError = false;
  message = '';

  constructor(
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private recoveryService: RecoveryDataService
  ) { }

  sendCode() {
    this.showError = false;
    this.email = this.email.toLowerCase();

    if (!this.email) {
      this.showError = true;
      this.message = 'Debes introducir un correo'
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.showError = true;
      this.message = 'El correo introducido no es válido.'
      return;
    }

    // Enviar JSON { email: ... }
    this.http.post('http://localhost:8081/api/auth/recoveryMail', this.email, { observe: 'response' }
    ).subscribe({
      next: response => {
        if (response.status == 200) {
          console.log('Código de recuperación enviado con éxito si existe');

          this.router.navigate(['/link-sent-confirmation']);

        }
      },
        error: err => {
        console.error('Error enviando dato:', err);
        this.showError = true;
        this.message = 'Error enviando el correo. Intenta de nuevo.';
      },
    });

    console.log('Solicitud de código enviada para', this.email);
  }

  goBack() {
    this.location.back();
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
