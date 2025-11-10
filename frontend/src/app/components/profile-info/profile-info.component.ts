import { Component,OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // <--- Afegeix Router

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
  @Input() isPublic: boolean = false;
  @Input() profileData: ProfileData = {} as ProfileData;

  ngOnChanges(): void {
    console.log('ProfileData changed:', this.profileData);
  }
}
