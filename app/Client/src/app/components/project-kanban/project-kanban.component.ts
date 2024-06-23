import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList, CdkDropListGroup} from '@angular/cdk/drag-drop';
import { CommonModule, NgFor } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { Observable} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { AddTaskComponent } from '../add-task/add-task.component';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { AddTaskStatusComponent } from '../add-task-status/add-task-status.component';
import { ProjectServiceGet } from '../../services/project.service';
import { DatePipe } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { Member } from '../../models/member';
import { MemberInfoComponent } from '../member-info/member-info.component';
import { MatCardModule } from '@angular/material/card';
import {environment} from "../../../environments/environment";
import {TaskOverviewComponent} from "../task-overview/task-overview.component";
import {HasProjectPermissionPipe} from "../../pipes/has-project-permission.pipe";
import {ProjectPermission} from "../../enums/project-permissions.enum";
import { MatSnackBar } from '@angular/material/snack-bar';
import {Task} from "../../models/task";
import {Project} from "../../models/project";
import {IsAssignedToTask} from "../../pipes/assigned-to-task.pipe";

import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-project-kanban',
  standalone: true,
  templateUrl: './project-kanban.component.html',
  styleUrl: './project-kanban.component.scss',
  providers: [DatePipe],
  imports: [CdkDropList, MatSelectModule, MatSlideToggleModule, MatFormFieldModule, ReactiveFormsModule, MatExpansionModule, MatCheckboxModule, FormsModule, MatDividerModule, MatIconModule, MatButtonModule, CdkDrag,
    CdkDropListGroup, NgFor, FormsModule, CommonModule, NgToastModule, MatDialogModule, AddTaskComponent, AddTaskStatusComponent, MatCardModule, HasProjectPermissionPipe, MatInputModule]
})

export class ProjectKanbanComponent implements OnInit {
  tasks: any[] = [];
  dropList: { name: string, id: number }[] = [];

  columnVisibility: { [key: string]: boolean } = {};
  selectedColumns: string[] = [];
  newStatuses: any[] = [];

  projectId: number = 0;
  projectName: string = "";
  projectDate: Date | undefined;
  searchedTerm: string = '';

  @Output() taskStatusAdded: EventEmitter<any> = new EventEmitter<any>();
  teamLeaderInfo: any;

  constructor(private taskService: TaskService, private projectService: ProjectServiceGet, private cdr: ChangeDetectorRef,  public dialog: MatDialog, private route: ActivatedRoute, private snackBar: MatSnackBar) {}

  ngOnInit(): void{
    this.getProjectIdFromRoute();
    this.loadTaskStatuses(this.projectId);
    this.dropList.forEach(column => {
      this.columnVisibility[column.name] = true;
      if (this.columnVisibility[column.name]) {
        this.selectedColumns.push(column.name);
      }
    });
  }

  isDefaultColumn(columnName: string): boolean {
    if (!columnName) {
      return false;
    }
    return ['new', 'in progress', 'completed'].includes(columnName.toLowerCase());
  }

  confirmDeleteColumn(column: { name: string, id: number }): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '500px',
      data: { message: `Are you sure you want to delete the column "${column.name}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteColumn(column);
      }
    });
  }

  deleteColumn(column: { name: string, id: number }): void {
    this.projectService.deleteTaskStatus(this.projectId, column.id).subscribe(
      () => {
        this.snackBar.open(`Column "${column.name}" deleted successfully.`, 'Close', { duration: 3000 });
        this.loadTaskStatuses(this.projectId);
      },
      error => {
        this.snackBar.open(`Failed to delete column "${column.name}".`, 'Close', { duration: 3000 });
        console.error('Error deleting column:', error);
      }
    );
  }

  loadTaskStatuses(projectId: number): void {
    this.taskService.getTaskStatusesByProject(projectId).subscribe((statuses: any[]) => {
      this.dropList = statuses.map(status => ({ name: status.name.toLowerCase(), id: status.id }));
      this.dropList.forEach(column => {
        this.columnVisibility[column.name] = true;
        if (this.columnVisibility[column.name]) {
          this.selectedColumns.push(column.name);
        }
      });
    });
  }

  toggleColumnVisibility(selectedColumns: string[]) {
    this.selectedColumns = selectedColumns;
    this.dropList.forEach(column => {
      this.columnVisibility[column.name] = this.selectedColumns.includes(column.name);
    });
  }


  getTeamLeaderInfo(projectId: number): void {
  this.projectService.getProjectById(projectId)
    .subscribe((projectData: any) => {
      const teamLeader = projectData.teamLider;
      if (teamLeader) {
        console.log('Informacije o tim lideru:', teamLeader);
        this.teamLeaderInfo = teamLeader;
      } else {
        console.error('Nije pronađen tim lider za dati projekat.');
      }
    }, error => {
      console.error('Greška prilikom dobijanja podataka o projektu:', error);
    });
  }

  getProjectByIdFromRoute(): void {
    this.route.params.subscribe(params => {
      const projectId = params['id'];
      console.log(params);
      if (projectId) {
        this.projectService.getProjectById(projectId)
          .subscribe((data: any) => {
            console.log('Podaci o projektu:', data);
            this.projectName = data.projectName;
            this.projectDate = data.deadline;
          }, error => {
            console.error('Greška prilikom dobijanja podataka o projektu:', error);
          });
      } else {
        console.error('ID projekta nije pronađen u URL-u.');
      }
    });
  }

  loadTasksByProject(projectId: number): void {
    this.taskService.getTasksByProject(projectId)
      .pipe(
        map((data: any[]) => {
          this.tasks = data;
          return data;
        }),
        catchError(error => {
          console.error('Error fetching tasks:', error);
          throw error;
        })
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }



  openMemberInfoDialog(member: Member): void {
    const dialogRef = this.dialog.open(MemberInfoComponent, {
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog zatvoren');
    });
  }

  getProjectIdFromRoute(): any{
    this.route.params.subscribe(params => {
      this.projectId = params['id'];

      this.loadTasksByProject(this.projectId);
      this.getTeamLeaderInfo(this.projectId);
      this.getProjectByIdFromRoute();
    });
  }



  updateTaskStatus(taskId: number, newStatusId: number): Observable<any> {
    return this.taskService.updateTaskStatus(taskId, newStatusId);
  }

  getStatusIdFromColumnName(columnName: string): number {
    const status = this.dropList.find(status => status.name.toLowerCase() === columnName);
    return status ? status.id : -1;
  }


  getTasksByStatus(statusId: number): any[] {
    return this.tasks.filter(task => task.taskStatusId === statusId).sort((a, b) => b.taskPriorityId - a.taskPriorityId);
  }

  findTaskIndex(taskId: number, statusId: number): number {
    const statusTasks = this.getTasksByStatus(statusId);
    return statusTasks.findIndex(task => task.taskId === taskId);
  }

  deleteTask(statusId: number, taskId: number) {
    const taskIndex = this.findTaskIndex(taskId, statusId);
    if (taskIndex !== -1) {
        const statusTasks = this.getTasksByStatus(statusId);
        statusTasks.splice(taskIndex, 1);
        this.taskService.deleteTask(taskId).subscribe(
            () => {
                // Prikazivanje poruke o uspešnom brisanju
                this.snackBar.open('Task deleted successfully.', 'Close', { duration: 3000 });

                // Ažuriranje liste taskova lokalno
                this.tasks = this.tasks.filter(task => task.taskId !== taskId);
            },
            error => {
                console.log("Error", error);
                this.snackBar.open('Failed to delete task.', 'Close', { duration: 3000 });
            }
        );
    }
}

  search(event: Event): void {
    this.searchedTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();

    // Filtriranje taskova na osnovu pretraženog termina
    this.tasks.forEach(task => {
      task.isVisible = task.taskName.toLowerCase().includes(this.searchedTerm);
    });
  }

  openDialog(): void{
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '500px',
      data: { projectId: this.projectId}
    });

    dialogRef.componentInstance.taskAdded.subscribe(() => {
      this.loadTasksByProject(1);
    });
  }

  openConfirmationDialog(column: string, index: number): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '500px',
      data: { column, index }
    });

    dialogRef.componentInstance.taskDeleted.subscribe(() => {
      this.loadTasksByProject(this.projectId);
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.deleteTask(result.column, result.index);
      }
    });
  }

  openTaskStatusDialog(): void {
    const dialogRef = this.dialog.open(AddTaskStatusComponent, {
        width: '500px',
        data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            const columnName = result.name.toLowerCase();
            if (columnName) {
                this.newStatuses.push(result.name);
                this.dropList.push({ name: columnName, id: result.id });
                this.columnVisibility[columnName] = true;
            }
        }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const taskId = event.item.data.taskId;
      const newStatusId = this.getStatusIdFromColumnName(event.container.id);

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      this.updateTaskStatus(taskId, newStatusId)
        .subscribe(
          () => {
            this.loadTasksByProject(this.projectId);
            this.snackBar.open('Task status updated successfully.', 'Close', {
              duration: 3000,
            });
          },
          error => console.error('Error updating task status:', error)
        );
    }
  }


  openTaskOverview(taskId: number): void {
    const task = this.tasks.find((task: Task) => task.taskId == taskId);

    this.projectService.getProjectById(task.projectId).subscribe((project : Project) =>
    {
      task.projectName = project.projectName;
    })

    const dialogRef = this.dialog.open(TaskOverviewComponent, {
      width: '1200px',
      height : '700px',
      data: task
    });

    dialogRef.componentInstance.taskModified.subscribe(() => {
      this.ngOnInit();
    });
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(this.dropList, event.previousIndex, event.currentIndex);
    }
  }

  protected readonly environment = environment;
  protected readonly ProjectPermission = ProjectPermission;
}
