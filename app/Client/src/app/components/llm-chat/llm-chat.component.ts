import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
  MatExpansionPanel,
  MatExpansionPanelActionRow, MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {MatHeaderCell} from "@angular/material/table";
import {MatError, MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatDivider} from "@angular/material/divider";
import {LlmConversation} from "../../models/llm-conversation";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LLMService} from "../../services/llm.service";
import {NgForOf, NgIf} from "@angular/common";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {CLIPBOARD_OPTIONS, ClipboardButtonComponent, MarkdownModule} from "ngx-markdown";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButton} from "@angular/material/button";



@Component({
  selector: 'app-llm-chat',
  standalone: true,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatInput,
    MatExpansionPanelActionRow,
    MatLabel,
    MatExpansionPanelDescription,
    MatDivider,
    ReactiveFormsModule,
    MatError,
    NgIf,
    MatHint,
    NgForOf,
    MatCardContent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MarkdownModule,
    MatProgressSpinner,
    MatButton
  ],
  templateUrl: './llm-chat.component.html',
  styleUrl: './llm-chat.component.scss',
})
export class LlmChatComponent implements AfterViewChecked {
  messages: LlmConversation[] = [];
  generating: boolean = false;
  question: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(200)
  ]);

  @ViewChild('input') questionInput!: ElementRef;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(private llmService: LLMService, private snackBar: MatSnackBar) {

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  submitQuestion() {
    if (this.question.valid) {
      const message: LlmConversation = {
        role: 'user',
        content: this.question.value
      };

      this.generating = true;
      this.question.reset();
      this.question.disable();
      this.messages.push(message);

      this.llmService.generateConversation(this.messages).subscribe({
        next: (data: any) => {
          this.generating = false;
          const response: LlmConversation = data.message;
          this.messages.push(response);
          this.question.enable();
          this.focusInput();
          this.question.markAsPristine();
        },
        error: err => {
          this.generating = false;
          this.snackBar.open("Failed continuining the conversation, try again", "Close", { duration: 1500 });
          this.question.enable();
          this.focusInput();
          this.question.markAsPristine();
        }
      });
    } else {
      this.snackBar.open("Message validation failed", "Close", { duration: 1500 });
    }
  }

  private focusInput() {
    this.questionInput.nativeElement.focus();
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }

  clearConversation() {
    this.messages = [];
  }
}
