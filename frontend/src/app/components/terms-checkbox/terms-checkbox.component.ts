import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-terms-checkbox',
  standalone: true,
  templateUrl: './terms-checkbox.component.html',
  styleUrls: ['./terms-checkbox.component.css']
})
export class TermsCheckboxComponent {
  @Output() checkedChange = new EventEmitter<boolean>();
  @Output() showTerms = new EventEmitter<void>();
  @Output() showPrivacy = new EventEmitter<void>();
  
  checked = false;

  onChange(event: any) {
    this.checked = event.target.checked;
    this.checkedChange.emit(this.checked);
  }

  openTerms(event: Event) {
    event.preventDefault();
    this.showTerms.emit();
  }

  openPrivacy(event: Event) {
    event.preventDefault();
    this.showPrivacy.emit();
  }
}