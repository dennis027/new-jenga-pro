import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllGigs } from './all-gigs';

describe('AllGigs', () => {
  let component: AllGigs;
  let fixture: ComponentFixture<AllGigs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllGigs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllGigs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
