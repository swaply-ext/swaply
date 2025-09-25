import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-next-button',
  standalone: true,
  templateUrl: './next-button.component.html',
  styleUrl: './next-button.component.css'
})
export class NextButtonComponent {


  @Output() submit = new EventEmitter<void>();

  onNextClick() {
    this.submit.emit(); 
  }
}
