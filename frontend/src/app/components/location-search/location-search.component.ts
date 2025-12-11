import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  HostListener,
  Input
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
import { SKIP_LOADING } from '../../interceptors/loading.interceptor';


export interface location {
  id: string;
  displayName: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
class LocationSearchService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8081/api/locations/autocomplete';

  searchlocations(query: string): Observable<location[]> {
    if (!query.trim()) {
      return of([]);
    }
    const params = new HttpParams().set('query', query);
    return this.http.get<location[]>(this.apiUrl, { params, context: new HttpContext().set(SKIP_LOADING, true) });
  }
}

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

  private locationSearchService = inject(LocationSearchService);
  private el = inject(ElementRef);

  searchTerm = '';
  // el signal sirve para almacenar variables que cambian con el tiempo
  results = signal<location[]>([]);
  isLoading = signal(false);
  showDropdown = signal(false);

  //esto srive para no tener que hacer una peticion cada vez que se escribe una letra
  private searchTermSubject = new Subject<string>();

  constructor() {
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
        return this.locationSearchService.searchlocations(term).pipe(
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

  // esto aun no funciona, es para cuando se seleccione una location de los resultados
  onSelectlocation(location: location): void {
    console.log('location seleccionada:', location);
    this.searchTerm = location.displayName;
    this.results.set([]);
    this.showDropdown.set(false);
  }
}
