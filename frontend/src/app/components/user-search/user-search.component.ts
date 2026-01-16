import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  HostListener,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, filter, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AccountService } from '../../services/account.service';
export interface UserSearchItem {
  id: string;
  username: string;
  profilePhotoUrl?: string;
}



@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSearchComponent {

  private currentUsername: string = '';

  searchTerm = '';
  results = signal<UserSearchItem[]>([]);
  isLoading = signal(false);
  showDropdown = signal(false);

  private searchTermSubject = new Subject<string>();

  constructor(
      private accountService: AccountService,
      private router: Router,
      private userSearchService: UsersService,
      private element: ElementRef

  ) {
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
    if (!this.element.nativeElement.contains(event.target)) {
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

    this.router.navigate(['/user', user.username]); 
    this.searchTerm = user.username;
    this.results.set([]);
    this.showDropdown.set(false);
    if (user.username === this.currentUsername) {
      this.router.navigate(['/myprofile']);  
    } else {
      this.router.navigate(['/user', user.username]);
    }
  }
}