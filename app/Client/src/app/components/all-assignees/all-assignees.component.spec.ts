import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAssigneesComponent } from './all-assignees.component';

describe('AllAssigneesComponent', () => {
  let component: AllAssigneesComponent;
  let fixture: ComponentFixture<AllAssigneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllAssigneesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllAssigneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
