import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-code-sent-confirmation',
  templateUrl: './code-sent-confirmation.component.html',
  styleUrl: './code-sent-confirmation.component.css'
})
export class CodeSentConfirmationComponent implements OnInit {


  constructor(private router: Router) {}

   ngOnInit(): void {
    // Redirige automáticamente al Home después de 3 segundos
    // setTimeout(() => {
    //   this.router.navigate(['/']);
    // }, 3000);
  }

   continueToVerification() {
    this.router.navigate(['/verify']);
}
}