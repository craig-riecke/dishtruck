import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindDropoffComponent } from './find-dropoff.component';

describe('FindDropoffComponent', () => {
  let component: FindDropoffComponent;
  let fixture: ComponentFixture<FindDropoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindDropoffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindDropoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
