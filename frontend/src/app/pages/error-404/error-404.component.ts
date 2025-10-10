import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-404',
  imports: [RouterLink],
  templateUrl: './error-404.component.html',
  styleUrl: './error-404.component.css'
})
export class Error404Component {
  constructor(private router: Router) {}

  backToLogin() {
    this.router.navigate(['/login']); // redirige al login
  }
}
