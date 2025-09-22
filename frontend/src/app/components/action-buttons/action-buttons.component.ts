import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.css'] 
})
export class ActionButtonsComponent {


  @Output() submit = new EventEmitter<void>();

  onRegistrarseClick() {
    this.submit.emit(); 
  }
}
