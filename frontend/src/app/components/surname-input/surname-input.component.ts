import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-surname-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './surname-input.component.html',
  styleUrl: './surname-input.component.css'
})
export class SurnameInputComponent {
  surname = '';
  @Output() surnameChange = new EventEmitter<string>();
}
