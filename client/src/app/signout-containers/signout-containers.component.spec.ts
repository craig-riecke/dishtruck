import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoutContainersComponent } from './signout-containers.component';

describe('SignoutContainersComponent', () => {
  let component: SignoutContainersComponent;
  let fixture: ComponentFixture<SignoutContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignoutContainersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoutContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
