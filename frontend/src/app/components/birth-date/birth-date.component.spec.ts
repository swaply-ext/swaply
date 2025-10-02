import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthDateComponent } from './birth-date.component';

describe('BirthDateComponent', () => {
  let component: BirthDateComponent;
  let fixture: ComponentFixture<BirthDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BirthDateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BirthDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
