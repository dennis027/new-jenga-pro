import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGigTypes } from './add-gig-types';

describe('AddGigTypes', () => {
  let component: AddGigTypes;
  let fixture: ComponentFixture<AddGigTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGigTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGigTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
