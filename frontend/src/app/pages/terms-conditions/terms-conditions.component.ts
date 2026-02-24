import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { AppNavbarComponent } from '../../components/app-navbar/app-navbar.component';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule, AppNavbarComponent, SideMenuComponent],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.css'
})
export class TermsConditionsComponent {
  @Input() isModal: boolean = false; 
  @Output() closeModal = new EventEmitter<void>(); 

  onClose() {
    this.closeModal.emit();
  }
}