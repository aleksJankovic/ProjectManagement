import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRoleOverviewComponent } from './project-role-overview.component';

describe('ProjectRoleOverviewComponent', () => {
  let component: ProjectRoleOverviewComponent;
  let fixture: ComponentFixture<ProjectRoleOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRoleOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectRoleOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
