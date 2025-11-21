import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.css'],
})
export class ExitComponent implements OnInit {

  private readonly TOKEN_KEY = 'authToken'; 
  countdown: number = 5;
  private intervalId: any;
  constructor(
    private router: Router
  ) {}

  /**
   * ngOnInit se ejecuta automáticamente cuando este componente se carga.
   */
  ngOnInit(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    console.log('Token borrado del localStorage.');
 //   this.startCountdown();
  }

}