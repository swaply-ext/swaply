import { TestBed } from '@angular/core/testing';
import { RecoveryDataService } from './recovery-data.service.service';

describe('RecoveryDataService', () => {
  let service: RecoveryDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecoveryDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
