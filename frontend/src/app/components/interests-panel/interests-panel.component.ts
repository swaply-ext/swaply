import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillCardComponent } from '../skill-card/skill-card.component';

@Component({
  selector: 'app-interests-panel',
  standalone: true,
  imports: [CommonModule, SkillCardComponent],
  templateUrl: './interests-panel.component.html',
  styleUrls: ['./interests-panel.component.css']
})
export class InterestsPanelComponent {
  // Inputs generales (Perfil y Swap)
  @Input() InterestsInput: any[] = [];
  @Input() isPublic: boolean = false;
  @Input() editable: boolean = false;
  
  // Título dinámico (por defecto 'Intereses' para el perfil)
  @Input() title: string = 'Intereses'; 

  // Inputs y Outputs exclusivos para el modo Swap
  @Input() selectable: boolean = false;
  @Input() selectedSkillId: string = '';
  @Output() skillSelected = new EventEmitter<any>();

  open = true;

  togglePanel() {
    this.open = !this.open;
  }

  handleLevelChange(newLevel: any, item: any) {
    // Lógica para cuando cambian el nivel en modo edición
    item.level = newLevel;
  }

  // Se dispara al hacer clic en una tarjeta si estamos en modo Swap
  onSkillSelected(item: any) {
    if (this.selectable) {
      this.skillSelected.emit(item);
    }
  }

  trackByFn(index: number, item: any) {
    return item.id || item.name;
  }
}