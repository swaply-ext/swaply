import { Component, Input, Output, EventEmitter, OnChanges, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsService, SkillDisplay } from './../../services/skills.service';

@Component({
  selector: 'app-skill-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-card.component.html',
  styleUrls: ['./skill-card.component.css']
})
export class SkillCardComponent implements OnChanges {
  @Input() id: string = '';
  @Input() level: number = 0;
  @Input() editable: boolean = false;

  // Nuevo: Evento para avisar al padre del cambio (útil para guardar luego)
  @Output() levelChange = new EventEmitter<{id: string, newLevel: number}>();

  private skillsService = inject(SkillsService);

  // Cambiamos Observable por variable local para poder mutarla al clickar
  skill: SkillDisplay | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el ID, recargamos los datos del servicio
    if (changes['id'] && this.id) {
      this.loadSkillData();
    }

    // Si cambia el nivel desde fuera (el padre), actualizamos nuestra variable local
    if (changes['level'] && this.skill) {
      this.skill.level = this.level;
    }
  }

  private loadSkillData() {
    this.skillsService.getSkillDisplay({ id: this.id, level: this.level })
      .subscribe(data => {
        this.skill = data;
      });
  }

  // Lógica del click en las barras
  changeLevel(clickedLevel: number) {
    if (!this.editable || !this.skill) return;

    // Si clicamos en el nivel que ya tiene, lo reseteamos a 0
    if (this.skill.level === clickedLevel) {
      this.skill.level = 0;
    } else {
      // Si no, asignamos el nuevo nivel
      this.skill.level = clickedLevel;
    }

    // Emitimos el evento por si el padre quiere guardar en BD
    this.levelChange.emit({ id: this.id, newLevel: this.skill.level });
  }
}
