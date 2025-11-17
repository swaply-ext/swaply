import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal
} from '@angular/core';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
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


export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
class SkillSearchService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8081/api/account/skills';

  searchSkills(query: string): Observable<Skill[]> {
    if (!query.trim()) {
      return of([]);
    }
    const params = new HttpParams().set('query', query);
    return this.http.get<Skill[]>(this.apiUrl, { params });
  }
}

@Component({
  selector: 'app-skill-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './skill-search.component.html',
  styleUrl: './skill-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillSearchComponent {
  private skillSearchService = inject(SkillSearchService);


  searchTerm = '';
  // el signal sirve para almacenar variables que cambian con el tiempo
  results = signal<Skill[]>([]);
  isLoading = signal(false);

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
        return this.skillSearchService.searchSkills(term).pipe(
          catchError(() => of([]))
        );
      }),
      // Desactiva el spinner (incluso si ha fallado)
      tap(() => this.isLoading.set(false))
    ).subscribe(results => {
      // Actualiza los resulyados
      this.results.set(results);
    });
  }

  onSearchTermChanged(term: string): void {
    this.searchTermSubject.next(term);
  }

  // esto aun no funciona, es para cuando se seleccione una skill de los resultados
  onSelectSkill(skill: Skill): void {
    console.log('Skill seleccionada:', skill);

  }
}
