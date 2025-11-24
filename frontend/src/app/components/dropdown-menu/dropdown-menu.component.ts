import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface DropdownMenuData {
  fullName: string;
  username: string;
  profilePhotoUrl: string;
  rating: number;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css']
})
export class DropdownMenuComponent {
  @Input() dropdownMenuData!: DropdownMenuData;

  constructor(private router: Router, private authService: AuthService) {}

  getStars(rating: number): string[] {
    const safeRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(safeRating);
    const decimal = safeRating - fullStars;
    const halfStar = decimal >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return [
      ...Array(fullStars).fill('star'),
      ...Array(halfStar).fill('star_half'),
      ...Array(emptyStars).fill('star_border')
    ];
  }

  goToMyProfile() {
    this.router.navigate(['/private-profile']);
  }

  goToMySwaps() {
    this.router.navigate(['/myswaps']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
