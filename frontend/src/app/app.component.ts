import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CookiesComponent } from './components/cookies/cookies.component';
import { LoadingService } from './services/loading.service';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookiesComponent, RouterModule, FormsModule, NgIf, LoadingScreenComponent, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'swapply';
  constructor(
    public loadingService: LoadingService
  ) { }
}
