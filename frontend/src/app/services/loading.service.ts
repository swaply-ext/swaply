import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _isLoading = new BehaviorSubject<boolean>(false);

  public isLoading$ = this._isLoading.asObservable();

  private readonly ANIMATION_TIME = 2000; // in milliseconds

  private _startTime: number = 0;
  private _hideTimer: any;

  constructor() { }
  show() {
    // Cancelar hide si hay otra llamada para que no parpadedee.
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }

    // Si se hace una llamada a show mientras ya está visible, no reseteamos el tiempo. continuamos la ultima animación.
    if (!this._isLoading.value) {
      this._startTime = Date.now();
      this._isLoading.next(true);
    }
  }

  hide() {
    // Calculamos cuánto tiempo ha pasado desde que se mostró
    const now = Date.now();
    const elapsedTime = now - this._startTime;

    // Calculamos cuánto tiempo llevamos dentro del bloque actual
    const timeInCurrentBlock = elapsedTime % this.ANIMATION_TIME;

    // Calculamos cuánto falta para terminar el bloque de la animación
    const timeToWait = this.ANIMATION_TIME - timeInCurrentBlock;

    // Programamos el ocultamiento
    this._hideTimer = setTimeout(() => {
      this._isLoading.next(false);
      this._hideTimer = null;
    }, timeToWait);
  }
}
