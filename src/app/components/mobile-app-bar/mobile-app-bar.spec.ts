import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileAppBar } from './mobile-app-bar';

describe('MobileAppBar', () => {
  let component: MobileAppBar;
  let fixture: ComponentFixture<MobileAppBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileAppBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileAppBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
