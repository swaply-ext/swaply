import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirige automáticamente al Home después de 3 segundos
    // setTimeout(() => {
    //   this.router.navigate(['/']);
    // }, 3000);
  }

  
  continueToHome() {
    this.router.navigate(['/']); 
  }
}
