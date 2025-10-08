import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestsPanelComponent } from './interests-panel.component';

describe('InterestsPanelComponent', () => {
  let component: InterestsPanelComponent;
  let fixture: ComponentFixture<InterestsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterestsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
