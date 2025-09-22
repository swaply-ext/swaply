import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailInputComponent } from './confirm-email-input.component';

describe('ConfirmEmailInputComponent', () => {
  let component: ConfirmEmailInputComponent;
  let fixture: ComponentFixture<ConfirmEmailInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmEmailInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmEmailInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
