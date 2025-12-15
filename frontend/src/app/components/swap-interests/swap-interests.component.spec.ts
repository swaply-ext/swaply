import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapInterestsComponent } from './swap-interests.component';

describe('SwapInterestsComponent', () => {
  let component: SwapInterestsComponent;
  let fixture: ComponentFixture<SwapInterestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwapInterestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwapInterestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
