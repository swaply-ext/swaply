import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  HostListener,
  Injectable
} from '@angular/core';
import { HttpClient, HttpClientModule, HttpContext, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter, catchError } from 'rxjs/operators';
import { SKIP_LOADING } from '../../interceptors/loading.interceptor';
import { Router } from '@angular/router';

// Minimal interface for frontend, no full backend DTO needed
export interface UserSearchItem {
  id: string;
  username: string;
  profilePhotoUrl?: string;
}

@Injectable({ providedIn: 'root' })
class UserSearchService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/users';

  searchUsers(query: string): Observable<UserSearchItem[]> {
    if (!query.trim()) return of([]);
    const params = new HttpParams().set('contains', query);
    return this.http.get<UserSearchItem[]>(this.apiUrl, {
      params,
      context: new HttpContext().set(SKIP_LOADING, true)
    });
  }
}

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSearchComponent {
  private router = inject(Router);
  private userSearchService = inject(UserSearchService);
  private el = inject(ElementRef);

  searchTerm = '';
  results = signal<UserSearchItem[]>([]);
  isLoading = signal(false);
  showDropdown = signal(false);

  private searchTermSubject = new Subject<string>();

  constructor() {
    this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length > 0 || term.length === 0),
      tap(() => this.isLoading.set(true)),
      switchMap(term => term.length === 0
        ? of([])
        : this.userSearchService.searchUsers(term).pipe(catchError(() => of([])))
      ),
      tap(() => this.isLoading.set(false))
    ).subscribe(results => {
      this.results.set(results);
      this.showDropdown.set(results.length > 0);
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  onInputFocus() {
    if (this.results().length > 0) this.showDropdown.set(true);
  }

  onSearchTermChanged(term: string) {
    this.searchTermSubject.next(term);
  }

  onSelectUser(user: UserSearchItem) {

    this.router.navigate(['/public-profile', user.username]); 
    this.searchTerm = user.username;
    this.results.set([]);
    this.showDropdown.set(false);
  }
}