import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DropdownMenuComponent, DropdownMenuData } from '../dropdown-menu/dropdown-menu.component';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, DropdownMenuComponent],
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.css']
})
export class AppNavbarComponent implements OnInit {
  showDropdown = false;
  userData!: DropdownMenuData;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getProfileData().subscribe({
      next: (user) => {
        this.userData = {
          
          //Aquí deberia de llegar un DTO que contenga estos campos, actualmente no es así
          fullName: `${user.name} ${user.surname}`,
          username: user.username,
          profilePhotoUrl: user.profilePhotoUrl,
          rating: user.rating ?? 3.8
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
}
