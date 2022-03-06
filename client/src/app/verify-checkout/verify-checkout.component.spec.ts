import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyCheckoutComponent } from './verify-checkout.component';

describe('VerifyCheckoutComponent', () => {
  let component: VerifyCheckoutComponent;
  let fixture: ComponentFixture<VerifyCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyCheckoutComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
