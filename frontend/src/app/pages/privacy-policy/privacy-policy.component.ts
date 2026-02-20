import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink, AppNavbarComponent, SideMenuComponent], 
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {}