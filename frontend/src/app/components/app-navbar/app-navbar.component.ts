import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-app-navbar',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './app-navbar.component.html',
  styleUrl: './app-navbar.component.css'
})
export class AppNavbarComponent {
  isMenuOpen = false;
   constructor(private router: Router) {}

}
