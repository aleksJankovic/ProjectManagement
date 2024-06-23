import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskStatusComponent } from './add-task-status.component';

describe('AddTaskStatusComponent', () => {
  let component: AddTaskStatusComponent;
  let fixture: ComponentFixture<AddTaskStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTaskStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
