import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGanttComponent } from './project-gantt.component';

describe('ProjectGanttComponent', () => {
  let component: ProjectGanttComponent;
  let fixture: ComponentFixture<ProjectGanttComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectGanttComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectGanttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
