import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CookiesComponent } from './components/cookies/cookies.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookiesComponent, RouterModule, FormsModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent {
  title = 'swapply';
}
