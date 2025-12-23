import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapSkillsComponent } from './swap-skills.component';

describe('SwapSkillsComponent', () => {
  let component: SwapSkillsComponent;
  let fixture: ComponentFixture<SwapSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwapSkillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwapSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
