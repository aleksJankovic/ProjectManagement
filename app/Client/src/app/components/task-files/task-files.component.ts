import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatButton, MatIconAnchor, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardTitle} from "@angular/material/card";
import {ProjectFile} from "../../models/project-file";
import {DatePipe, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {RouterLink} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ProjectPermission} from "../../enums/project-permissions.enum";
import {HasProjectPermissionPipe} from "../../pipes/has-project-permission.pipe";
import {AuthService} from "../../services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatSort, MatSortHeader, Sort} from "@angular/material/sort";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {Task} from "../../models/task";
import {TaskService} from "../../services/task.service";
import {IsAssignedToTask} from "../../pipes/assigned-to-task.pipe";

@Component({
  selector: 'app-task-files',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    NgIf,
    MatIcon,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatIconButton,
    MatDivider,
    RouterLink,
    HasProjectPermissionPipe,
    MatCardActions,
    MatPaginator,
    MatCardTitle,
    MatIconAnchor,
    MatTable,
    DatePipe,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatSortHeader,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatSort,
    IsAssignedToTask
  ],
  templateUrl: './task-files.component.html',
  styleUrl: './task-files.component.scss'
})
export class TaskFilesComponent implements OnInit {
  @Input({
    required: true
  }) task!: Task;

  @ViewChild(MatSort) sort: any;
  @ViewChild(MatPaginator) paginator: any;

  files: ProjectFile[] = [];
  authId: number = Number(this.authService.getAuthenticatedMembersId());
  dataSource: any;
  displayedColumns: string[] = ['originalName',  'fullName', 'actions'];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private liveAnnouncer: LiveAnnouncer
  ) {

  }

  ngOnInit(): void {
    this.taskService.getTaskFiles(this.task.taskId).subscribe({
      next: (data: ProjectFile[]) => {
        this.files = data;
        this.dataSource = new MatTableDataSource(data);

        console.log(this.files.length == 0)
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      },
      error: err => {
        console.log('failed fetching project files');
      }
    });
  }

  protected readonly environment = environment;
  protected readonly ProjectPermission = ProjectPermission;

  deleteFile(fileId: number) {
    this.taskService.deleteTaskFile(this.task.taskId, fileId).subscribe({
      next: data => {
        const indexToRemove = this.files.findIndex((file: ProjectFile) => file.fileId == fileId);
        if (indexToRemove !== -1)
          this.files.splice(indexToRemove, 1);

        this.dataSource.data = this.files;

        this.snackBar.open('Successfully deleted file!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.snackBar.open('Failed deleting file!', 'Close', { duration: 3000 });
      }
    })
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this.liveAnnouncer.announce('Sorting cleared');
    }
  }

  uploadFiles(event: any) {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      const formData: FormData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i], files[i].name);
      }

      this.taskService.uploadFiles(this.task.taskId, formData).subscribe({
        next: data => {
          this.ngOnInit();
          this.snackBar.open('Successfully uploaded files!', 'Close', { duration: 3000 });
          event.target.value = '';
        },
        error: err => {
          this.snackBar.open('There was an error with uploading your files!', 'Close', { duration: 3000 });
          event.target.value = '';
        }
      });
    } else {
      this.snackBar.open('No files detected for upload!', 'Close', { duration: 3000 });
    }
  }

  search(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
