import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentResponse } from '../models/payment.model';



@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private readonly API_URL = 'http://localhost:8081/api/payment'; 

  constructor(private http: HttpClient) { }

  createCheckoutSession(): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.API_URL}/checkout`, {});
  }
}