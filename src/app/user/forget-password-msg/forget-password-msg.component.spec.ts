import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswordMsgComponent } from './forget-password-msg.component';

describe('ForgetPasswordMsgComponent', () => {
  let component: ForgetPasswordMsgComponent;
  let fixture: ComponentFixture<ForgetPasswordMsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetPasswordMsgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswordMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
