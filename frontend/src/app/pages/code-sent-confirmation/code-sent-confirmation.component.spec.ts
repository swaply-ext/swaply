import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSentConfirmationComponent } from './code-sent-confirmation.component';

describe('CodeSentConfirmationComponent', () => {
  let component: CodeSentConfirmationComponent;
  let fixture: ComponentFixture<CodeSentConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeSentConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeSentConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
