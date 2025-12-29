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

  // input para manejar la seleccion
  @Input() selected: boolean = false;

  @Output() levelChange = new EventEmitter<{id: string, newLevel: number}>();

  private skillsService = inject(SkillsService);

  skill: SkillDisplay | null = null;

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['id'] && this.id) {
      this.loadSkillData();
    }

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

  changeLevel(clickedLevel: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (!this.editable || !this.skill) return;

    if (this.skill.level === clickedLevel) {
      this.skill.level = 0;
    } else {
      this.skill.level = clickedLevel;
    }

    // emitimos el evento por si el padre quiere guardar en bd
    this.levelChange.emit({ id: this.id, newLevel: this.skill.level });
  }

  toggleCardLevel() {
    if (!this.editable || !this.skill) return;

    if (this.skill.level === 0 || this.skill.level === 1) {
      this.changeLevel(1);
    }
  }
}
