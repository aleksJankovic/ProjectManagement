import { CommonModule } from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProjectServiceGet } from '../../services/project.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-project.component.html',
  styleUrl: './confirmation-project.component.scss',
  standalone: true,
  imports:[MatDialogModule, MatButtonModule, MatButton, CommonModule, RouterLink]
})
export class ConfirmationProjectComponent  implements OnInit {
  projectId: number = 0;

  constructor(public dialogRef: MatDialogRef<ConfirmationProjectComponent>,
              private projectService: ProjectServiceGet, private route: ActivatedRoute, @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar){}

  ngOnInit() {
    this.projectId = this.data.projectId;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  showMessage(){
    this.snackBar.open('Project deleted successfully.', 'Close', { duration: 3000 });
  }

  confirmDelete(): void {
    this.projectService.deleteProjectById(this.projectId).subscribe(
      () => {
        this.showMessage();
        this.dialogRef.close();
      },
      error => {
        console.error('Error deleting project:', error);
        // Dodajte odgovarajući tretman greške
      }
    );
  }
}
