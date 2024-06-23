import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from "@angular/material/table";
import {DatePipe} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatSort, MatSortHeader, Sort} from "@angular/material/sort";
import {RouterLink} from "@angular/router";
import {Project} from "../../models/project";
import {ProjectServiceGet} from "../../services/project.service";
import {AuthService} from "../../services/auth.service";
import {data} from "autoprefixer";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {Task} from "../../models/task";
import {TaskService} from "../../services/task.service";
import { FormsModule } from '@angular/forms';
import { ProjectStatus } from '../../models/project-status';
import { ProjectPriority } from '../../models/project-priority';
import { taskPriority } from '../../models/taskPriority';
import { MatCardModule } from '@angular/material/card';
import {TaskOverviewComponent} from "../task-overview/task-overview.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    DatePipe,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatMenu,
    MatMenuItem,
    MatSortHeader,
    MatHeaderCellDef,
    MatMenuTrigger,
    RouterLink,
    MatSort,
    MatRow,
    MatRowDef,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    MatPaginator,
    MatCardModule,
    MatIconButton
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  projects!: Project[];
  dataSource: any;
  tasks!: Task[];

  selectedStatus: number = 0;
  defaultStatus: number = 0;
  defaultPriority: number = 0;
  selectedPriority: number = 0;
  projectPriorities: ProjectPriority[] = [];

  defaultTaskPriority: number = 0;
  selectedTaskPriority: number = 0;
  taskPriorities !: taskPriority[];

  searchProjects: string = '';
  searchTasks: string = '';
  projectStatuses !: ProjectStatus[];

  memberId!: any;

  projectSource: any;
  projectColumns: string[] = ['projectName', 'startDate', 'deadline', 'status', 'projectPriority',  'actions'];

  taskSource: any;
  taskColumns: string[] = ['taskName', 'startDate', 'deadline', 'taskPriorityName', 'taskStatus', 'actions'];

  totalTasks: number = 0;
  startedTasks: number = 0;
  newTasks: number = 0;
  completedTasks: number = 0;


  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(private authService: AuthService, private _liveAnnouncer: LiveAnnouncer,
                private projectService: ProjectServiceGet, private taskService: TaskService,
                public dialog: MatDialog,
                ) { }

  onStatusChange(event: any) {
    this.selectedStatus = event;
    this.applyFilters();
  }

  onPriorityFilterChange(event: any) {
    this.selectedPriority = event;
    this.applyFilters();
  }

  onTaskPriorityFilterChange(event: any) {
    this.selectedTaskPriority = event;
    this.applyTaskFilters();
  }

  applyTaskFilters() {
    this.taskSource.data = this.tasks.filter(task =>
    (this.selectedTaskPriority == this.defaultTaskPriority || this.selectedTaskPriority == task.taskPriorityId)
    );
  }

  applyFilters() {
    this.projectSource.data = this.projects.filter(project =>
    (this.selectedStatus == this.defaultStatus || this.selectedStatus == project.projectStatusId) &&
    (this.selectedPriority == this.defaultPriority || this.selectedPriority == project.projectPriorityId)
    );
  }

  ngOnInit(): void {
    this.memberId = this.authService.getAuthenticatedMembersId();

    this.projectService.getAllProjectsWhereMemberIsAssigned(this.memberId).subscribe({
      next: data=> {
        this.projects = data;
        this.projectSource = new MatTableDataSource(this.projects);
        this.projectSource.sort = this.sort.toArray()[0];
        this.projectSource.paginator = this.paginator.toArray()[0];
      },
      error: error => {
        console.log('failed fetching project data');
      }
    });

    this.taskService.getTasksByMember(this.memberId).subscribe({
      next: data => {
        this.tasks = data;
        this.taskSource = new MatTableDataSource(this.tasks);
        this.taskSource.sort = this.sort.toArray()[1];
        this.taskSource.paginator = this.paginator.toArray()[1];
        this.totalTasks = this.tasks.length;
      },
      error: error => {
        console.log('failed fetching task data');
      }
    });

    this.projectService.getAllProjectStatuses().subscribe({
      next: (data: ProjectStatus[]) => {
        this.projectStatuses = data;

        this.newTasks = this.tasks.filter(task => task.taskStatus === "New").length;
        this.startedTasks = this.tasks.filter(task => task.taskStatus === "In Progress").length;
        this.completedTasks = this.tasks.filter(task => task.taskStatus === "Completed").length;
      },
      error: error => {
        console.log('failed fetching project statuses');
      }
    })

    this.projectService.getProjectPriorities().subscribe({
      next: (data: ProjectPriority[]) => {
        this.projectPriorities = data;
      },
      error: err => {
        console.log('failed fetching project priorities');
      }
    });

    this.taskService.getTaskPriorities().subscribe({
      next: (data: taskPriority[]) => {
        this.taskPriorities = data;
      },
      error: error => {
        console.log('failed fetching task priorities');
      }
    });

  }

  searchProj(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.projectSource.filter = filterValue.trim().toLowerCase();
  }

  searchTask(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.taskSource.filter = filterValue.trim().toLowerCase();
  }

  protected readonly data = data;

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  openDialog(task: Task) {
    console.log(task)
    const dialogRef = this.dialog.open(TaskOverviewComponent, {
      width: '1200px',
      height : '700px',
      data: task
    });

    dialogRef.componentInstance.taskModified.subscribe(() => {
      this.ngOnInit()
    });
  }
}
