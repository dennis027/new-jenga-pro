import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JengaDash } from './jenga-dash';

describe('JengaDash', () => {
  let component: JengaDash;
  let fixture: ComponentFixture<JengaDash>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JengaDash]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JengaDash);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
