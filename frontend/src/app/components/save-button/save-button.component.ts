import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-save-button',
  imports: [],
  templateUrl: './save-button.component.html',
  styleUrl: './save-button.component.css'
})
export class SaveButtonComponent {
  @Output() submit = new EventEmitter<void>();

  onSaveClick() {
    this.submit.emit(); 
  }
}
