import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-terms-checkbox',
  standalone: true,
  templateUrl: './terms-checkbox.component.html',
  styleUrls: ['./terms-checkbox.component.css']
})
export class TermsCheckboxComponent {
  @Output() checkedChange = new EventEmitter<boolean>();
  checked = false;

  onChange(event: any) {
    this.checked = event.target.checked;
    this.checkedChange.emit(this.checked);
  }
}
