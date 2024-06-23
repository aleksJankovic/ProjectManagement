import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgxEditorModule, Editor, Validators } from 'ngx-editor';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { Member } from '../../models/member';
import {MatOption, MatSelect, MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatError, MatFormField, MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatSnackBar} from "@angular/material/snack-bar";
import { ProjectServiceGet } from '../../services/project.service';
import { th } from 'date-fns/locale';
import {LLMResponse} from "../../models/llm-response";
import {Project} from "../../models/project";
import {LLMService} from "../../services/llm.service";

@Component({
  selector: 'app-add-task',
  standalone: true,
    imports: [NgxEditorModule, MatFormFieldModule, MatSelectModule, FormsModule,  CommonModule, NgToastModule, MatButton,
        MatIcon,
        MatToolbar,
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatFormField,
        MatInput,
        MatLabel,
        MatSelect,
        MatOption,
        MatCardActions,
        ReactiveFormsModule,
        MatError, MatDatepicker, MatDatepickerInput, MatDatepickerToggle],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit, OnDestroy{
  editor: Editor = new Editor;
  html = '';
  taskName: string = '';
  taskDescription: string = '';
  deadline: Date | null = null;
  projectId: number | null = null;
  taskPriorities: any;
  projectMembers: Member[] = [];
  selectedMembers: Member[] = [];
  assignedMembersIds: number[] = [];
  members = new FormControl('');
  taskForm!: FormGroup;
  today = new Date();
  isLoading: boolean = false;
  projectDeadline : Date |null = null;
  project!: Project;
  @Output() taskAdded: EventEmitter<any> = new EventEmitter<any>();


  constructor(public dialogRef: MatDialogRef<AddTaskComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private taskService: TaskService, private snackBar: MatSnackBar, private fb: FormBuilder,
            private projectService : ProjectServiceGet, private llmService: LLMService) {}

  ngOnInit() {
    this.projectId = this.data.projectId;

    this.getProjectMembers();

    this.taskService.getTaskPriorities().subscribe({
      next: data => {
        this.taskPriorities = data;
      },
      error: error => {
        console.log('failed fetching task priorities');
      }
    });

    this.projectService.getProjectById(this.data.projectId).subscribe({
      next: projectData => {
        this.projectDeadline = projectData.deadline;
        this.project = projectData;
      },
      error: error => {
        console.log('Failed fetching project data');
      }
    });

    this.taskForm = this.fb.group({
      taskName: ['', Validators.required],
      deadline: ['', Validators.required],
      taskPriorityId: ['', Validators.required],
      assignedMemberIds: [[], [Validators.required]],
      taskLeaderId: ['', Validators.required],
      taskDescription: ['', [Validators.required]],
      projectId: [this.projectId]
    });

    this.taskForm.get('assignedMemberIds')?.valueChanges.subscribe(selectedIds => {
      console.log('Selected Member IDs:', selectedIds);  // Debugging statement
      this.selectedMembers = this.projectMembers.filter(member => selectedIds.includes(member.id));
      if (!selectedIds.includes(this.taskForm.get('taskLeaderId')?.value)) {
        this.taskForm.get('taskLeaderId')?.reset();
      }
      console.log('Selected Members:', this.selectedMembers);  // Debugging statement
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  todayDate(): string {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
}

  saveTask(){
    if (this.taskForm.invalid) {
      this.snackBar.open('Form inputs are invalid.', 'Close', { duration: 3000 });
      this.taskForm.markAllAsTouched();

      return;
    }

    this.isLoading = true;

    const taskData = this.taskForm.value;

    //console.log(this.assignedMembersIds);
    this.taskService.saveTask(taskData).subscribe(response => {
      this.taskAdded.emit();
      this.snackBar.open('Task added successfully.', 'Close', {
        duration: 3000,
      });
      this.closeDialog();

      this.isLoading = false;
    }, error => {
      console.error('Error saving task', error);
      this.isLoading = false;
    });
  }

  showMessage(){
    this.snackBar.open('Successfully saved task.', 'Close', { duration: 3000 });
  }

  getProjectMembers() {
    if (this.projectId) {
      this.taskService.getProjectMembers(this.projectId).subscribe({
        next: (data: Member[]) => {
          this.projectMembers = data;
        },
        error: error => {
          console.log('Error fetching project members:', error);
        }
      });
    }
  }

  generateDescription() {
    if (this.taskForm.get('taskName')?.valid) {
      const taskName: string = this.taskForm.get('taskName')?.value;
      const question: string = `My assigned project is ${this.project.projectName}. I want to create a task named ${taskName}. Can you help me make a short description.
      I just want you to write me the task description, no comments, or anything else.`;

      this.isLoading = true;
      this.llmService.generateText(question).subscribe({
        next: (data: LLMResponse) => {
          this.taskForm.get('taskDescription')?.setValue(data.response);
          this.snackBar.open('Successfully generated description', 'Close', { duration: 3000 });
          this.isLoading = false;
        },
        error: error => {
          this.snackBar.open('Failed to generate description using AI', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.snackBar.open('You must enter a title!', 'Close', { duration: 3000 });
    }
  }
}
