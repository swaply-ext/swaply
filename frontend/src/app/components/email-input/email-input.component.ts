import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./email-input.component.css'],
  templateUrl: './email-input.component.html'
})
export class EmailInputComponent {
  @Input() email: string = '';
  @Input() hasError: boolean = false; 
  @Output() emailChange = new EventEmitter<string>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.emailChange.emit(value);
  }
}
