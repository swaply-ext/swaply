import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwapService {
  private apiUrl = 'http://localhost:8081/api/swap'; //he cambiado la ruta base de la api para así poder pillar en este mismo service diferentes datos

  constructor(private http: HttpClient) {}
  getNextSwap(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/showNextSwap`);
  }
}
