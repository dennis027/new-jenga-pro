import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSites } from './add-sites';

describe('AddSites', () => {
  let component: AddSites;
  let fixture: ComponentFixture<AddSites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSites);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
