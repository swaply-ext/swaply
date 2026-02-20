import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink, AppNavbarComponent, SideMenuComponent], 
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {
  @Input() isModal: boolean = false; 
  @Output() closeModal = new EventEmitter<void>(); 

  onClose() {
    this.closeModal.emit();
  }
}