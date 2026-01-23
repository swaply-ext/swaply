import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; 
import { PaymentService } from '../services/payment.service';
import { PaymentResponse } from '../models/payment.model';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',      
  styleUrls: ['./landing.css']           
})
export class LandingComponent {

  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  irAPagar() {
    //verificación de si está logueado, si no lo está te manda al login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return; 
    }

    this.loadingService.show(); //metemos el spinner

    this.paymentService.createCheckoutSession().subscribe({
      next: (response: PaymentResponse) => {
        window.location.href = response.paymentUrl;
      },
      error: (error) => {
        console.error('Error al crear la sesión de pago:', error);
        this.loadingService.hide();//lo quitamos, no cabe duda
        if (error.status === 409) {
        alert('¡Ya eres usuario Premium! No necesitas pagar de nuevo.'); //quitar en PR
        this.router.navigate(['/home']); //al home si ya has pagado
      }
      else{
        alert('Lo sentimos, hubo un problema al conectar con la pasarela de pago. Por favor, inténtalo más tarde.'); // momentaneo para testing, metedme un comentario si se me ha olvidado quitarlo eb la PR}
    
      }
    }});
  }
}