import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { Swap } from '../../models/swap.models';
import { ProfileDataDTO } from '../../models/data.models';



@Component({
  selector: 'app-swap-requests',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, RouterLink],
  templateUrl: './swap-requests.component.html',
  styleUrl: './swap-requests.component.css'
})
export class SwapRequestsComponent implements OnInit {
  private swapService = inject(SwapService);
  private usersService = inject(UsersService);

  requests = signal<Swap[]>([]);
  loading = signal<boolean>(true);

  profilesMap = signal<Map<string, ProfileDataDTO>>(new Map());

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.swapService.getAllSwaps().subscribe({
      next: (data: Swap[]) => {
        const pending = data.filter(s => s.status === 'STANDBY' && s.isRequester === false);

        this.requests.set(pending);
        this.loadProfiles(pending);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando solicitudes', err);
        this.loading.set(false);
      }
    });
  }

  loadProfiles(swapsList: Swap[]) {
    const userIds = new Set(swapsList.map(s => s.requestedUserId));

    userIds.forEach(id => {
      if (!this.profilesMap().has(id)) {
        this.usersService.getUserById(id).subscribe(profile => {
          this.profilesMap.update(map => {
            const newMap = new Map(map);
            newMap.set(id, profile);
            return newMap;
          });
        });
      }
    });
  }


  acceptRequest(swap: Swap) {
    this.swapService.updateSwapStatus(swap.id, 'ACCEPTED').subscribe({
      next: () => {
        this.removeSwapFromList(swap.id);
      },
      error: (err) => console.error(err)
    });
  }

  rejectRequest(swap: Swap) {
    this.swapService.updateSwapStatus(swap.id, 'DENIED').subscribe({
      next: () => {
        this.removeSwapFromList(swap.id);
      },
      error: (err) => console.error(err)
    });
  }

  private removeSwapFromList(swapId: string) {
    this.requests.update(list => list.filter(s => s.id !== swapId));
  }


  getProfile(userId: string): ProfileDataDTO {
    return this.profilesMap().get(userId) as ProfileDataDTO;
  }

  getSkillImage(skillName: string): string {
     return 'assets/photos_skills/default.jpg';
  }
}
