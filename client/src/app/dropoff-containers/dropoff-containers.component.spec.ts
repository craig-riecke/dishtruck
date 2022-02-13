import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropoffContainersComponent } from './dropoff-containers.component';

describe('DropoffContainersComponent', () => {
  let component: DropoffContainersComponent;
  let fixture: ComponentFixture<DropoffContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropoffContainersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropoffContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
