import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersToProjectComponent } from './add-members-to-project.component';

describe('AddMembersToProjectComponent', () => {
  let component: AddMembersToProjectComponent;
  let fixture: ComponentFixture<AddMembersToProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersToProjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMembersToProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
