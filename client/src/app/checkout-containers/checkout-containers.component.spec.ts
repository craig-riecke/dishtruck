import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutContainersComponent } from './checkout-containers.component';

describe('CheckoutContainersComponent', () => {
  let component: CheckoutContainersComponent;
  let fixture: ComponentFixture<CheckoutContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutContainersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
