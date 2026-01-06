import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { ChatService } from '../../services/chat.service';
interface Location {
  placeId: string;
  lat: number;
  lon: number;
  displayName: string;
}

interface PanelSkill {
  id: string;
  level: number;
}

interface ProfileData {
  fullName: string;
  username: string;
  location: Location;
  description: string;
  profilePhotoUrl: string;
  rating: number;
}

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.css']
})
export class ProfileInfoComponent implements OnChanges {
  @Input() profileData: ProfileData = {} as ProfileData;

  // SOLUCIÓN: Añadimos el input para que Angular no de error
  @Input() isReadOnly: boolean = false;
  @Input() isPublic: boolean = false;
  @Input() skills: PanelSkill[] = [];

  ngOnChanges(): void {
    console.log('ProfileData changed:', this.profileData);
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private accountService: AccountService,
    private chatService: ChatService,
     ) { }
  starsArray = [1, 2, 3, 4, 5];

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  contactUser() {
    const target = this.profileData?.username;
    if (!target) return;
    this.chatService.createRoomWithUsername(target).subscribe({
      next: (room: any) => {
        // Navigate to chat and select the room
        this.router.navigate(['/chat'], { queryParams: { roomId: room.id } });
      },
      error: (err: any) => {
        console.error('Error creando sala', err);
        // Fallback: navigate to chat without room
        this.router.navigate(['/chat']);
      }
    });
  }
  goToEdit(){
    // Evitamos navegar si es solo lectura
    if (!this.isReadOnly) {
      this.router.navigate(['/profile-edit']);
    }
  }

  goToSwap(): void {
    if (!this.profileData?.username) return;
  
    const targetUsername = this.profileData.username;
    let queryParms: any = {};

    // cojemos la primera skill por defecto
    if (this.skills && this.skills.length > 0) {
      const defaultSkill = this.skills[0];
      queryParms = {
        skillName: defaultSkill.id,
        level: defaultSkill.level
      };
    }

    this.router.navigate(['/swap', targetUsername], { queryParams: queryParms });
  }  
}
