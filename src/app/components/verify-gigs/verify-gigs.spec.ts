import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyGigs } from './verify-gigs';

describe('VerifyGigs', () => {
  let component: VerifyGigs;
  let fixture: ComponentFixture<VerifyGigs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyGigs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyGigs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
