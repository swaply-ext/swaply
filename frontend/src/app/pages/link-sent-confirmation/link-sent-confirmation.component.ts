import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-sent-confirmation',
  templateUrl: './link-sent-confirmation.component.html',
  styleUrls: ['./link-sent-confirmation.component.css']
})
export class LinkSentConfirmationComponent implements OnInit {

   ngOnInit(): void {
    // Redirige automáticamente al Home después de 3 segundos
    // setTimeout(() => {
    //   this.router.navigate(['/']);
    // }, 3000);
  }

}
