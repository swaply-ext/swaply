import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPasswordInputComponent } from './confirm-password-input.component';

describe('ConfirmPasswordInputComponent', () => {
  let component: ConfirmPasswordInputComponent;
  let fixture: ComponentFixture<ConfirmPasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmPasswordInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmPasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
