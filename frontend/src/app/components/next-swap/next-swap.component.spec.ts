import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextSwapComponent } from './next-swap.component';

describe('NextSwapComponent', () => {
  let component: NextSwapComponent;
  let fixture: ComponentFixture<NextSwapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextSwapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NextSwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
