import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <--- Afegeix Router
import { AuthService } from '../../services/auth.service';

interface ProfileData {
  fullName: string;
  username: string;
  location: string;
  description: string;
  profilePhotoUrl: string;
}
@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent {
  @Input() profileData: ProfileData = {} as ProfileData;

  ngOnChanges(): void {
    console.log('ProfileData changed:', this.profileData);
  }

  constructor(private authService: AuthService) { } // <--- Injecció de Router
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
