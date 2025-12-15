import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundiDash } from './fundi-dash';

describe('FundiDash', () => {
  let component: FundiDash;
  let fixture: ComponentFixture<FundiDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundiDash]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundiDash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
