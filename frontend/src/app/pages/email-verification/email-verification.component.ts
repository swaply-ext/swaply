import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { RegisterDataService } from '../../services/register-data.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})

//get de toda la info del user + codigo de verify enviado por el backend a 

export class EmailVerificationComponent {

  code: string[] = ['', '', '', '', '', ''];
  validCode: any;


  constructor(
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private registerDataService: RegisterDataService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.validCode = navigation?.extras?.state?.['code'];
    this.validCode = String(this.validCode);
  }

  ngOnInit() {
    const allData = this.registerDataService.getRegisterData();
    console.log("Código válido para verificación:", this.validCode);
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    input.value = value;
    this.code[index] = value;

    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      next?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }

  verifyCode(): void {
    const fullCode = this.code.join('');

    if (fullCode.length < 6) {
      alert('Introduce los 6 dígitos antes de continuar.');
      return;
    }

    console.log('Introducido', fullCode);
    if (fullCode === this.validCode) {
      const allData = this.registerDataService.getRegisterData();
      const { verifyCode, ...dataToSend } = allData;
      // despues de vericiar hay que enviar el objeto infoUser ENTERO (sin verify)
      this.http.post('http://localhost:8081/api/account/register', dataToSend) //envia el codigo de verificacion al endpoint de back y loc comprueban
        .subscribe({
          next: response => {
            this.router.navigate(['/confirmation']);
          },
          error: err => {
            alert('Error enviando datos al backend');
            console.error('Error enviando datos:', err);
          }
        }) // solo activaremos la api si hace falta doble comprobar en front (ya esta), en back si lo enviamos  */

    } else {

      alert('Código incorrecto');
    }
  }

  goBack(): void {
    this.location.back();
  }
}
