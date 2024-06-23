import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatToolbar } from '@angular/material/toolbar';
import { FormGroup } from 'smart-webcomponents-angular';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-task-status',
  standalone: true,
  imports: [FormsModule, CommonModule, NgToastModule, MatButton, MatDialogModule,
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
    MatError, MatFormFieldModule, MatSelectModule],
  templateUrl: './add-task-status.component.html',
  styleUrl: './add-task-status.component.scss'
})
export class AddTaskStatusComponent implements OnInit{
  taskStatusName: string = '';
  projectId!: number;
  taskStatusForm!: FormGroup;
  tasks= new FormControl('');

  @Output() taskAdded: EventEmitter<any> = new EventEmitter<any>();
  @Output() taskStatusAdded: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<AddTaskStatusComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
              private taskService: TaskService, private route: ActivatedRoute, private fb: FormBuilder, private snackBar: MatSnackBar){}

  ngOnInit() {
    this.projectId = this.data.projectId;

  }

  getProjectIdFromRoute(){
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveTaskStatus(): void {
  

    this.taskService.addTaskStatus(this.projectId, this.taskStatusName).subscribe(
      (response) => {
        this.snackBar.open('Task status added successfully.', 'Close', {
          duration: 3000,
        });
        this.taskStatusAdded.emit();
        this.dialogRef.close(response); 
      },
      (error) => {
        console.error('Error adding task status:', error);
      }
    );
  }

}
