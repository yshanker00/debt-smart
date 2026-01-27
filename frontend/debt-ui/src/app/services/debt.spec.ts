import { TestBed } from '@angular/core/testing';

import { Debt } from './debt';

describe('Debt', () => {
  let service: Debt;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Debt);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
