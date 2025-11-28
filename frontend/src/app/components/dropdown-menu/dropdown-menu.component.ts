import { Component, Input, Output, EventEmitter, ElementRef, HostListener, inject } from '@angular/core';
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
  @Output() closeMenu = new EventEmitter<void>();

  private el = inject(ElementRef);

  constructor(private router: Router, private authService: AuthService) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Si el clic NO ha sido dentro de este menú...
    if (!this.el.nativeElement.contains(event.target)) {
      // ...emitimos el evento para que el padre lo cierre
      this.closeMenu.emit();
    }
  }

  getStars(rating: number): { icon: string; filled: boolean }[] {
    const safeRating = Math.max(0, Math.min(5, rating));
    const fullStars = Math.floor(safeRating);
    const decimal = safeRating - fullStars;
    const halfStar = decimal >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return [
      ...Array(fullStars).fill({ icon: 'star', filled: true }),
      ...Array(halfStar).fill({ icon: 'star_half', filled: true }),
      ...Array(emptyStars).fill({ icon: 'star', filled: false })
    ];
  }



  goToMyProfile() {
    this.router.navigate(['/myprofile']);
    this.closeMenu.emit();
  }

  goToMySwaps() {
    //this.router.navigate(['/myswaps']);
  }

  goToSettings() {
    this.router.navigate(['/profile-edit']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMenu.emit();
  }
}
