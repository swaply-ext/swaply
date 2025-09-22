import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CookiesComponent } from './components/cookies/cookies.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookiesComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'swapply';
}
