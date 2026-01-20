import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpesaPayments } from './mpesa-payments';

describe('MpesaPayments', () => {
  let component: MpesaPayments;
  let fixture: ComponentFixture<MpesaPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpesaPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpesaPayments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
