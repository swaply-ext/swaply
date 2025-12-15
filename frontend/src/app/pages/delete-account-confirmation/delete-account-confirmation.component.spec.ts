import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAccountConfirmationComponent } from './delete-account-confirmation.component';

describe('ConfirmationComponent', () => {
  let component: DeleteAccountConfirmationComponent;
  let fixture: ComponentFixture<DeleteAccountConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAccountConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteAccountConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
