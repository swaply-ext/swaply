import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gender-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gender-input.component.html',
  styleUrls: ['./gender-input.component.css']
})
export class GenderInputComponent {
  @Input() gender: string = '';
  @Input() hasError: boolean = false;
  @Output() genderChange = new EventEmitter<string>();

  onSelectChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.genderChange.emit(value);
  }
}

