import { TestBed } from '@angular/core/testing';

import { GigServices } from './gig-services';

describe('GigServices', () => {
  let service: GigServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GigServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
