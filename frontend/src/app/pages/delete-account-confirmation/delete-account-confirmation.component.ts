import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service'; // Asegúrate de que la ruta sea correcta
import { CommonModule } from '@angular/common'; // Importa si usas standalone

@Component({
  selector: 'app-delete-account-confirmation',
  standalone: true, // Asumo que es standalone como el anterior
  imports: [CommonModule],
  templateUrl: './delete-account-confirmation.component.html',
  styleUrls: ['./delete-account-confirmation.component.css']
})
export class DeleteAccountConfirmationComponent implements OnInit {

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
  }

  // Acción de Confirmar Borrado
  confirmDelete() {
    this.accountService.deleteAccount().subscribe({
      next: () => {
        // 1. Eliminar token
        localStorage.removeItem('authToken');
        
        // 2. Redirigir al login
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error('Error al eliminar cuenta', err);
      }
    });
  }

  // Acción de Cancelar (Volver atrás)
  cancel() {
    this.router.navigate(['/privacy-and-security']); 
  }
}