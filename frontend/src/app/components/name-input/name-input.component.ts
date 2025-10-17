import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-name-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './name-input.component.html',
  styleUrl: './name-input.component.css'
})
export class NameInputComponent {
  name = '';
  @Output() nameChange = new EventEmitter<string>();
}
