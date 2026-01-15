import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentConfirmationDTO, PaymentResponse } from '../models/payment.model';



@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private readonly API_URL = 'http://localhost:8081/api/payment'; 

  private http = inject(HttpClient); //el inject es mejor que el constructor, pero sirve oara lo mismo

  createCheckoutSession(): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.API_URL}/checkout`, {});
  }

  
  confirmPaymentSuccess(sessionId: string): Observable<void> {
    const body: PaymentConfirmationDTO = { sessionId }; 
    return this.http.post<void>(`${this.API_URL}/success`, body);
  }
}
