import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login-button',
  standalone: true,
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.css'] 
})
export class LoginButtonComponent {


  @Output() submit = new EventEmitter<void>();

  onLoginClick() {
    this.submit.emit(); 
  }
}
