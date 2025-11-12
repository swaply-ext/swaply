import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <--- Afegeix Router
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent {

  fullName = 'Juan Pérez';
  username = 'juanperez123';
  ubicacion = 'Madrid, España';
  description = 'ipsum dolor sit amet...';
  avatarUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Alberto_Chicote-RakutenBolsa_%28derivative%29.jpg';

  constructor(private router: Router, private authService: AuthService) {} // <--- Injecció de Router
  get isLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }
}
