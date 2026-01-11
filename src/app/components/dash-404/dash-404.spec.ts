import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dash404 } from './dash-404';

describe('Dash404', () => {
  let component: Dash404;
  let fixture: ComponentFixture<Dash404>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dash404]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dash404);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
