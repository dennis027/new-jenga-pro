import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWorkers } from './manage-workers';

describe('ManageWorkers', () => {
  let component: ManageWorkers;
  let fixture: ComponentFixture<ManageWorkers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageWorkers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWorkers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
