import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SwapListComponent, Profile } from '../../components/swap-list/swap-list.component';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { Swap } from '../../models/swap.model';

@Component({
  selector: 'app-my-swaps-page',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SwapListComponent],
  templateUrl: './my-swaps.component.html',
  styleUrl: './my-swaps.component.css'
})
export class MySwapsPageComponent implements OnInit {
  private swapService = inject(SwapService);
  private usersService = inject(UsersService);
  private router = inject(Router);


  acceptedSwaps: Swap[] = [];
  pendingSwaps: Swap[] = [];


  pendingProfiles = new Map<string, Profile>();


  isLoading = true;

  ngOnInit() {
    this.loadAllSwaps();
  }

  loadAllSwaps() {
    this.isLoading = true;

    this.swapService.getAllSwaps().subscribe({
      next: (data: Swap[]) => {

        this.acceptedSwaps = data.filter(s => s.status === 'ACCEPTED');

        this.pendingSwaps = data.filter(s => s.status === 'STANDBY' && s.isRequester === false);

        this.loadPendingProfiles();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando swaps', err);
        this.isLoading = false;
      }
    });
  }

  loadPendingProfiles() {
    const userIds = new Set(this.pendingSwaps.map(s => s.requestedUserId));

    userIds.forEach(id => {
      this.usersService.getUserById(id).subscribe(profile => {
        this.pendingProfiles.set(id, profile);
      });
    });
  }


  getRequesterUser(swap: Swap): Profile | undefined {
    return this.pendingProfiles.get(swap.requestedUserId);
  }


  get bannerText(): string {
    const count = this.pendingSwaps.length;
    if (count === 0) return '';


    const firstSwap = this.pendingSwaps[0];
    const firstProfile = this.pendingProfiles.get(firstSwap.requestedUserId);
    const name = firstProfile?.username || 'Usuario';

    if (count === 1) {
      return `<b>@${name}</b> solicita un intercambio.`;
    } else {
      return `<b>@${name}</b> y <b>${count - 1} más</b> solicitan intercambios.`;
    }
  }

  // 3. Navegación
  goToRequests() {
    this.router.navigate(['/notifications']);
  }
}
