import { Component, OnInit, Renderer2, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { DropdownMenuComponent, DropdownMenuData } from '../dropdown-menu/dropdown-menu.component';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { UserSearchComponent } from '../user-search/user-search.component';
import { ComingSoonComponent } from '../../pages/coming-soon/coming-soon.component';

@Component({
  selector: 'app-app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, DropdownMenuComponent, UserSearchComponent],
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit, OnDestroy {
  showDropdown = false;
  isMobileMenuOpen = false;
  dropdownMenuData!: DropdownMenuData;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private authService: AuthService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'with-navbar');
    this.accountService.getProfileData().subscribe({
      next: (user) => {
        this.dropdownMenuData = {
          fullName: `${user.name} ${user.surname}`,
          username: user.username,
          profilePhotoUrl: user.profilePhotoUrl,
          // Se añade la propiedad isPremium obtenida del servicio de cuenta
          isPremium: user.isPremium,
          rating: 3.8
        };
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'with-navbar');
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }
}
