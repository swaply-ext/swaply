import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-code-sent-confirmation',
  templateUrl: './code-sent-confirmation.component.html',
  styleUrls: ['./code-sent-confirmation.component.css']
})
export class CodeSentConfirmationComponent {


  constructor(private router: Router) {}

   continueToVerification() {
    this.router.navigate(['/verify']);
}
}