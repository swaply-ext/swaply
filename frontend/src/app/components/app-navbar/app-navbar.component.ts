import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-navbar',
  imports: [],
  standalone: true,
  templateUrl: './app-navbar.component.html',
  styleUrl: './app-navbar.component.css'
})
export class AppNavbarComponent {
  isMenuOpen = false;
   constructor(private router: Router) {}

}
