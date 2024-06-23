import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-confirmation-assignee',
  standalone: true,
  imports: [NgToastModule],
  templateUrl: './confirmation-assignee.component.html',
  styleUrl: './confirmation-assignee.component.scss'
})
export class ConfirmationAssigneeComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmationAssigneeComponent>, private taskService: TaskService,  @Inject(MAT_DIALOG_DATA) public data: any){}

  closeDialog(): void {
    this.dialogRef.close();
  }


  confirmDelete(): void{
    this.dialogRef.close(this.data);
  }


}
