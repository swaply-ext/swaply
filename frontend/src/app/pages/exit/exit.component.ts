import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.css']
})
export class ExitComponent implements OnInit {

  // 👇 ¡IMPORTANTE! 
  // Cambia 'token' por el nombre exacto de tu clave en localStorage.
  private readonly TOKEN_KEY = 'authToken'; 

  constructor() { }

  /**
   * ngOnInit se ejecuta automáticamente cuando este componente se carga.
   */
  ngOnInit(): void {
    // 1. Borra el token del localStorage del navegador
    localStorage.removeItem(this.TOKEN_KEY);
    
    // 2. Opcionalmente, puedes verificar que se borró (para depurar)
    console.log('Token borrado del localStorage.');
  }

}