import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <div class="flex flex-col gap-2">
        <p>{{data.message1}}</p>
        <p>{{data.message2}}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <div class="w-full flex gap-2">
        <span class="grow"></span>
        <button mat-button [mat-dialog-close]="false">No</button>
        <button mat-raised-button color="warn"  [mat-dialog-close]="true">Yes</button>
      </div>
    </mat-dialog-actions>
  `,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatButton,
    MatDialogClose
  ],
  standalone: true
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
