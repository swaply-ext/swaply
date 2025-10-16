import { TestBed } from '@angular/core/testing';

import { RecoveryDataServiceService } from './recovery-data.service.service';

describe('RecoveryDataServiceService', () => {
  let service: RecoveryDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecoveryDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
