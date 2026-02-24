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
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { SkillsService } from '../../services/skills.service';


export interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-filter-skills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './filter-skills.component.html',
  styleUrls: ['./filter-skills.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterSkillsComponent {
private skillsService = inject(SkillsService);
  private el = inject(ElementRef)

  @Output() filterChange = new EventEmitter<string>();

  isOpen = signal(false);
  results = signal<Skill[]>([]);
  isLoading = signal(false);

  private searchSubject = new Subject<void>();

  categories = [
    {
      name: 'Deportes',
      id: 'sports',
      open: true,
      subcategories: [
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
        if (!selectedIds) {
          return of([]);
        }
        return this.skillsService.searchSkills(selectedIds).pipe(
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
    this.searchSubject.next();
  }


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
  }

  // Método público para limpiar todas las selecciones de filtros
  clear(): void {
    this.categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.selected = false;
      });
    });
    this.results.set([]);
  }
  reset(): void {
    this.clear();
    this.filterChange.emit('');
    this.searchSubject.next();
  }
}
