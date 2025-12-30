import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { DropdownMenuComponent, DropdownMenuData } from '../dropdown-menu/dropdown-menu.component';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { UserSearchComponent } from '../user-search/user-search.component';

@Component({
  selector: 'app-app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, DropdownMenuComponent, UserSearchComponent],
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit {
  showDropdown = false;
  dropdownMenuData!: DropdownMenuData;

  constructor(private router: Router, private accountService: AccountService, private authService: AuthService) {}

  ngOnInit(): void {
    this.accountService.getProfileData().subscribe({
      next: (user) => {
        this.dropdownMenuData = {

          //Aquí deberia de llegar un DTO específico co nestso campos, actualmente se utiliza un DTO erroneo para hacer el apaño
          fullName: `${user.name} ${user.surname}`,
          username: user.username,
          profilePhotoUrl: user.profilePhotoUrl,
          rating: 3.8
        };
      },
      error: (err) => {
        console.error('Error al obtener datos del perfil:', err);
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

    goToNotifications() {
    this.router.navigate(['/notifications']);
  }
}
