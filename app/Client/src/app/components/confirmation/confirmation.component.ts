import { CommonModule } from '@angular/common';
import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
  standalone: true,
  imports:[MatDialogModule, MatButtonModule, MatButton, CommonModule, RouterLink]
})
export class ConfirmationComponent {
  @Output() taskDeleted: EventEmitter<void> = new EventEmitter<void>();

  taskId: number = 0;
  constructor(public dialogRef: MatDialogRef<ConfirmationComponent>,
    private taskService: TaskService, private route: ActivatedRoute, @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.taskId = this.data.index;
  }

  confirmDelete(): void {
    this.taskService.deleteTask(this.taskId).subscribe(
      () => {
        this.snackBar.open('Task deleted successfully.', 'Close', {
          duration: 3000,
        });
        this.taskDeleted.emit(); // Emituje događaj kada je task obrisan
        this.dialogRef.close();
      },
      error => {
        console.error('Error deleting task:', error);
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
