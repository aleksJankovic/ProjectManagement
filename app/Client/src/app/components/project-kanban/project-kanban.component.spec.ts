import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectKanbanComponent } from './project-kanban.component';

describe('KanbanComponent', () => {
  let component: ProjectKanbanComponent;
  let fixture: ComponentFixture<ProjectKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectKanbanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
