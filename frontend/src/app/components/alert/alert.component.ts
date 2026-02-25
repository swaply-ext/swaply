import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para ngClass
import { AlertService } from '../../services/alert.service';
import { AlertCategory } from '../../models/alert.model';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  public alertService = inject(AlertService);

  getIcon(category: AlertCategory): string {
    const icons = {
      success: 'check',
      error: 'close',
      warning: 'warning',
      info: 'info'
    };
    return icons[category] || 'help_outline';
  }
}
