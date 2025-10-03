import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-auth',
  templateUrl: './error-auth.component.html',
  styleUrls: ['./error-auth.component.css']
})
export class ErrorAuthComponent {
  constructor(private router: Router) {}

  backToLogin() {
    this.router.navigate(['/login']); // redirige al login
  }
}
