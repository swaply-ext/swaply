import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSearchComponent } from './skill-search.component';

describe('SkillSearchComponent', () => {
  let component: SkillSearchComponent;
  let fixture: ComponentFixture<SkillSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
