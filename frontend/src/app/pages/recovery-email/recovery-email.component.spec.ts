import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryEmailComponent } from './recovery-email.component';

describe('RecoveryEmailComponent', () => {
  let component: RecoveryEmailComponent;
  let fixture: ComponentFixture<RecoveryEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoveryEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoveryEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
