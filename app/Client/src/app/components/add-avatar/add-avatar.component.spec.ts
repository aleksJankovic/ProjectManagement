import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAvatarComponent } from './add-avatar.component';

describe('AddAvatarComponent', () => {
  let component: AddAvatarComponent;
  let fixture: ComponentFixture<AddAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAvatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
