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

  // Constructor con inyección de dependencias
  constructor(
    private location: Location,                         // Permite navegar hacia atrás
    private router: Router,                             // Permite la navegación entre rutas 
    private http: HttpClient,                           // Permite hacer peticiones HTTP
    private registerDataService: RegisterDataService    // Servicio para manejar datos de registro
  ) {

    // Extrae el código de verificación desde el estado de navegación
    const navigation = this.router.getCurrentNavigation();
    this.validCode = navigation?.extras?.state?.['code'];
    this.validCode = String(this.validCode);
  }

  ngOnInit() {
    // Recupera todos los datos del usuario desde el servicio
    const allData = this.registerDataService.getRegisterData();
    console.log("Código válido para verificación:", this.validCode);
  }
  // Maneja la entrada de cada dígito del código
  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    // Elimina cualquier carácter que no sea número
    const value = input.value.replace(/\D/g, '');
    input.value = value;
    this.code[index] = value;

    // Si hay valor y no es el último campo, enfoca el siguiente
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      next?.focus();
    }
  }
  // Permite pegar el código completo en los campos
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    // Obtiene el texto del portapapeles y lo convierte en array de dígitos
    const pasteCode = event.clipboardData?.getData('text') || '';
    const digits = pasteCode.replace(/\D/g, '').slice(0, 6).split('');

    // Asigna cada dígito a su campo correspondiente
    digits.forEach((digit, i) => {

      const input = document.getElementById(`code-${i}`) as HTMLInputElement;
      if (input) {
        input.value = digit;
        this.code[i] = digit;
      }
    });

    // Enfoca el siguiente campo disponible
    const nextIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.getElementById(`code-${nextIndex}`) as HTMLInputElement;
    nextInput?.focus();
  }


    // Enfoca el siguiente campo disponible
    const nextIndex = digits.length < 6 ? digits.length : 5;
    const nextInput = document.getElementById(`code-${nextIndex}`) as HTMLInputElement;
    nextInput?.focus();
  }

  // Permite retroceder al campo anterior si se presiona Backspace en un campo vacío
  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prev?.focus();
    }
  }
  // Verifica si el código introducido coincide con el recibido
  verifyCode(): void {
    const fullCode = this.code.join('');

    // Cambiar el alert por algo mas bonito
    if (fullCode.length < 6) {
      alert('Introduce los 6 dígitos antes de continuar.');
      return;
    }

    // Si el código es correcto, envía los datos del usuario al backend
    console.log('Introducido', fullCode);
    if (fullCode === this.validCode) {
      const allData = this.registerDataService.getRegisterData();
      // Elimina el campo 'verifyCode' antes de enviar
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
      // Cambiar el alert por algo mas bonito
      alert('Código incorrecto');
    }
  }

  goBack(): void {
    this.location.back();
  }

}
