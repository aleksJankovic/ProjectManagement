import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlmChatComponent } from './llm-chat.component';

describe('LlmChatComponent', () => {
  let component: LlmChatComponent;
  let fixture: ComponentFixture<LlmChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlmChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LlmChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
