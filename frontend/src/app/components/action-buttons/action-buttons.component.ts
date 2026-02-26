import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.css']
})
export class ActionButtonsComponent {

  @Output() submit = new EventEmitter<void>();

  constructor(private router: Router) {}

  // Botón "Registrar"
  onRegistrarseClick() {
    localStorage.removeItem('authToken');
    this.submit.emit();
  }

  // Botón "Iniciar sesión"
  onLoginClick() {
    this.router.navigate(['/login']);
  }
}
