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

  @Input() selected: boolean = false;

  @Input() selectable: boolean = false;
  @Output() cardSelected = new EventEmitter<SkillDisplay>();

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

    if (this.skill.level === 0 && clickedLevel <= 1){
      console.log(clickedLevel)
      this.skill.level = 1;
    }
    else if (this.skill.level === clickedLevel) {
      this.skill.level = 0;
    } else {
      this.skill.level = clickedLevel;
    }

    this.levelChange.emit({ id: this.id, newLevel: this.skill.level });
  }

  handleCardClick() {
    if (this.editable && this.skill) {
      this.changeLevel(this.skill.level); 
    } else if (this.selectable && this.skill) {
      this.cardSelected.emit(this.skill); 
    }
  }
}
