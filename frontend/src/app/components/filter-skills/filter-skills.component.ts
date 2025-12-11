import { 
  Component, 
  ChangeDetectionStrategy, 
  inject, 
  signal,
  ElementRef,
  HostListener,
  Output,
  EventEmitter 
} from '@angular/core';
import { HttpClient, HttpClientModule, HttpContext, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { SKIP_LOADING } from '../../interceptors/loading.interceptor';

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
class FilterSkillsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/account/skills';

  searchSkills(query: string): Observable<Skill[]> {
    if (!query.trim()) {
      return of([]);
    }
    const params = new HttpParams().set('query', query);
    return this.http.get<Skill[]>(this.apiUrl, { params, context: new HttpContext().set(SKIP_LOADING, true) });
  }
}

@Component({
  selector: 'app-filter-skills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './filter-skills.component.html',
  styleUrls: ['./filter-skills.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSkillsComponent {
  private service = inject(FilterSkillsService);
  private el = inject(ElementRef)

  @Output() filterChange = new EventEmitter<string>();

  isOpen = signal(false);
  results = signal<Skill[]>([]);
  isLoading = signal(false);

  private searchSubject = new Subject<string>();

  categories = [
    {
      name: 'Deportes',
      id: 'sports',
      open: true,
      subcategories: [
        // EL ID DEBE SER EL DE LA BASE DE DATOS (Inglés)
        { name: 'FÚTBOL ⚽', id: 'football', selected: false },    
        { name: 'PÁDEL 🎾', id: 'padel', selected: false },       
        { name: 'BÁSQUET 🏀', id: 'basketball', selected: false }, 
        { name: 'VÓLEY 🏐', id: 'volleyball', selected: false },   
        { name: 'BOXEO 🥊', id: 'boxing', selected: false }       
      ]
    },
    {
      name: 'Música',
      id: 'music',
      open: true,
      subcategories: [
        { name: 'GUITARRA 🎸', id: 'guitar', selected: false },    
        { name: 'PIANO 🎹', id: 'piano', selected: false },
        { name: 'VIOLÍN 🎻', id: 'violin', selected: false },
        { name: 'BATERÍA 🥁', id: 'drums', selected: false },      
        { name: 'SAXOFÓN 🎷', id: 'saxophone', selected: false }
      ]
    },
    {
      name: 'Ocio',
      id: 'leisure',
      open: true,
      subcategories: [
        { name: 'DIBUJO 🎨', id: 'drawing', selected: false },
        { name: 'COCINA 👨‍🍳', id: 'cooking', selected: false }, 
        { name: 'BAILE 💃', id: 'dance', selected: false },
        { name: 'MANUALIDADES 🛠️', id: 'crafts', selected: false },
        { name: 'OCIO DIGITAL 🖥️', id: 'digital', selected: false }
      ]
    }
  ];

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isLoading.set(true)),
      switchMap(() => {
        const selectedIds = this.getSelectedIds();
        if (!selectedIds) return of([]);
        return this.service.searchSkills(selectedIds).pipe(
          catchError(() => of([]))
        );
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe(results => this.results.set(results));
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Si el clic no es dentro del filtro, se cierra el dropdown
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleFilter() {
    this.isOpen.update(open => !open);
  }

  toggleCategory(cat: any) {
    cat.open = !cat.open;
  }

  toggleSub(sub: any) {

    sub.selected = !sub.selected;
    const selected = this.getSelectedIds();
    this.filterChange.emit(selected);
  }

  // Obtiene IDs seleccionados como cadena separada por comas
  private getSelectedIds(): string {
    const ids: string[] = [];
    this.categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        if (sub.selected) ids.push(sub.id);
      });
    });
    return ids.join(',');
  }

  onSelectSkill(skill: Skill) {
    console.log('Skill seleccionada:', skill);
    // aquí podrías redirigir a perfil o mostrar detalles
  }
}
