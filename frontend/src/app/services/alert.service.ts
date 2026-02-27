import { Injectable, signal, inject } from '@angular/core';
import { AlertCategory, AlertData } from '../models/alert.model';
import { ALERT_LIBRARY } from '../components/alert/alert-defaults';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertSignal = signal<(AlertData & { category: AlertCategory }) | null>(null);
  public alert = this.alertSignal.asReadonly();
  private router = inject(Router);


  show(category: AlertCategory, type?: any, overrides?: Partial<AlertData>) {
    const categoryGroup = ALERT_LIBRARY[category];
    const defaults = categoryGroup[type] || categoryGroup['generic'];
    this.alertSignal.set({
      ...defaults,
      ...overrides,
      category // Categoría para los colores del CSS
    });
  }

  close() {
    const currentError = this.alertSignal();
    this.alertSignal.set(null);
    if (currentError?.redirectToHome) {
      const currentUrl = this.router.url;
      if (currentUrl !== '/' && currentUrl !== '/home') {
        this.router.navigate(['/home']);
      }
    }
  }
}
