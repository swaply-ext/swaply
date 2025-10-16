import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassVerificationComponent } from './pass-verification.component';

describe('PassVerificationComponent', () => {
  let component: PassVerificationComponent;
  let fixture: ComponentFixture<PassVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
