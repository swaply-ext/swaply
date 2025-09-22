import { Component } from '@angular/core';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [NgIf],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.css'
})
export class CookiesComponent {
  show = !localStorage.getItem('cookieAccept')
  accept() {
    localStorage.setItem('cookieAccept', 'true');
      this.show = false;
  }

}
