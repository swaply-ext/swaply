import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentConfirmationDTO, PaymentResponse } from '../models/payment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from './alert.service';



@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly API_URL = '/payment';

  private http = inject(HttpClient); //el inject es mejor que el constructor, pero sirve oara lo mismo
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  createCheckoutSession(): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.API_URL}/checkout`, {});
  }


  confirmPaymentSuccess(sessionId: string): Observable<void> {
    const body: PaymentConfirmationDTO = { sessionId };
    return this.http.post<void>(`${this.API_URL}/success`, body);
  }


  checkPaymentStatus(setLoading: (isLoading: boolean) => void) {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id']; //busca si existe el parámetro que nos manda Stripe
      if (sessionId) {
        //si hay un id verifica el pago
        this.verifyPayment(sessionId, setLoading);
      }
    });
  }

  private verifyPayment(sessionId: string, setLoading: (isLoading: boolean) => void) {
    //Se mete el spinner mientras se verifica
    setLoading(true);
    //llama al backend para verificar si el sessionId es válido y activar el premium     //no se si esto se podria meter en el payment service
    this.confirmPaymentSuccess(sessionId).subscribe({
      next: () => {

        //se limpia la URL para quitar el session_id
        this.alertService.show('success', 'premium');         
        this.router.navigate([], {
          queryParams: { session_id: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });        
        setLoading(false);
      },
      error: (err) => {
        console.error('Error verificando pago:', err);
        this.alertService.show('error', 'payment');
        setLoading(false);
      }
    });
  }
}
