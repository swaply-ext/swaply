import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyAndSecurityComponent } from './privacy-and-security.component';

describe('PrivacyAndSecurityComponent', () => {
  let component: PrivacyAndSecurityComponent;
  let fixture: ComponentFixture<PrivacyAndSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyAndSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyAndSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
