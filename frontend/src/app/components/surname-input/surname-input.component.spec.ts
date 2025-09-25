import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurnameInputComponent } from './surname-input.component';

describe('SurnameInputComponent', () => {
  let component: SurnameInputComponent;
  let fixture: ComponentFixture<SurnameInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurnameInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurnameInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
