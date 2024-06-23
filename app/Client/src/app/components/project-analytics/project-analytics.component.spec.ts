import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAnalyticsComponent } from './project-analytics.component';

describe('ProjectAnalyticsComponent', () => {
  let component: ProjectAnalyticsComponent;
  let fixture: ComponentFixture<ProjectAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
