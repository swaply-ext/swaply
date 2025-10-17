import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenderInputComponent } from './gender-input.component';

describe('GenderInputComponent', () => {
  let component: GenderInputComponent;
  let fixture: ComponentFixture<GenderInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenderInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenderInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
