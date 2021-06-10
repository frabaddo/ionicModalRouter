import { TestBed } from '@angular/core/testing';

import { ModalRouterController } from './modal-router.service';

describe('ModalRouterService', () => {
  let service: ModalRouterController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalRouterController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
