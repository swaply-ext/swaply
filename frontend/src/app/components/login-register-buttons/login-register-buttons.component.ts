import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login-register-buttons',
  imports: [],
  templateUrl: './login-register-buttons.component.html',
  styleUrls: ['./login-register-buttons.component.css']
})
export class LoginRegisterButtonsComponent {
  @Output() loginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<void>();


  onRegistrarseClick() {
    this.registerClick.emit(); 
  }

  
  onLoginClick() {
    this.loginClick.emit();
  }
}


