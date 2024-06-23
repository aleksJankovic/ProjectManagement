import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationProjectComponent } from './confirmation-project.component';

describe('ConfirmationProjectComponent', () => {
  let component: ConfirmationProjectComponent;
  let fixture: ComponentFixture<ConfirmationProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationProjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmationProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
