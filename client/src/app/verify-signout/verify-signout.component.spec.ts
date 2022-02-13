import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifySignoutComponent } from './verify-signout.component';

describe('VerifySignoutComponent', () => {
  let component: VerifySignoutComponent;
  let fixture: ComponentFixture<VerifySignoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifySignoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifySignoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
