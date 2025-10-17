import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorAuthComponent } from './error-auth.component';

describe('ErrorAuthComponent', () => {
  let component: ErrorAuthComponent;
  let fixture: ComponentFixture<ErrorAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
