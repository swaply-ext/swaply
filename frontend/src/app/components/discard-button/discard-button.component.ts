import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-discard-button',
  imports: [],
  templateUrl: './discard-button.component.html',
  styleUrl: './discard-button.component.css'
})
export class DiscardButtonComponent {
    @Output() submit = new EventEmitter<void>();

  onDiscardClick() {
    this.submit.emit(); 
  }
}
