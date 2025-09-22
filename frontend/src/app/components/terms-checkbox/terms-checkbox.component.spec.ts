import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsCheckboxComponent } from './terms-checkbox.component';

describe('TermsCheckboxComponent', () => {
  let component: TermsCheckboxComponent;
  let fixture: ComponentFixture<TermsCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
