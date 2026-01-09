import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { HttpClient, HttpClientModule, HttpContext, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  filter,
  catchError
} from 'rxjs/operators';
import { LocationService } from '../../services/location.service';
import { UserLocation } from '../../models/user.models';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSearchComponent {

  @Input() placeholder: string = 'Buscar Ubicación...';

  @Output() locationSelected = new EventEmitter<UserLocation | null>(); // <-- Este es el Output clave
  private el = inject(ElementRef);

  searchTerm = '';
  // el signal sirve para almacenar variables que cambian con el tiempo
  results = signal<UserLocation[]>([]);
  isLoading = signal(false);
  showDropdown = signal(false);

  //esto srive para no tener que hacer una peticion cada vez que se escribe una letra
  private searchTermSubject = new Subject<string>();

  constructor(private locationService: LocationService) {
    this.searchTermSubject.pipe(
      // delay entre teclas para evitar muchas peticiones
      debounceTime(300),
      // no busca si el texto es el mismo que el anterior
      distinctUntilChanged(),
      // Busca si tiene mas de 1 letra o si se ha borrado todo
      filter(term => term.length > 0 || term.length === 0),
      // Esto hace que se active un spinner (pantalla de carga) mientras se carga
      tap(() => this.isLoading.set(true)),
      // Cancela búsquedas anteriores y lanza la nueva
      switchMap(term => {
        if (term.length === 0) {
          return of([]);
        }
        return this.locationService.autocompleteLocation(term).pipe(
          catchError(() => of([]))
        );
      }),
      // Desactiva el spinner (incluso si ha fallado)
      tap(() => this.isLoading.set(false))
    ).subscribe(results => {
      // Actualiza los resulyados
      this.results.set(results);

      if (results.length > 0) {
        this.showDropdown.set(true);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Si el clic no es dentro de este componente, cierra el dropdown
    if (!this.el.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  //Al hacer clic en el input, volvemos a mostrar el dropdown si hay datos
  onInputFocus() {
    if (this.results().length > 0) {
      this.showDropdown.set(true);
    }
  }

  onSearchTermChanged(term: string): void {
    this.searchTermSubject.next(term);
  }

  onSelectlocation(location: UserLocation): void {
    console.log('location seleccionada:', location);
    this.searchTerm = location.displayName;
    this.results.set([]);
    this.showDropdown.set(false);
    this.locationSelected.emit(location);
  }
}
