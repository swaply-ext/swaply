import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkSentConfirmationComponent } from './link-sent-confirmation.component';

describe('LinkSentConfirmationComponent', () => {
  let component: LinkSentConfirmationComponent;
  let fixture: ComponentFixture<LinkSentConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkSentConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkSentConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
