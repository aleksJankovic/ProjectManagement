import { Component, OnInit, ViewChild } from '@angular/core';
import { Member } from '../../models/member';
import { taskActivity } from '../../models/taskActivity';
import { CommonModule } from '@angular/common';
import { TaskOverviewComponent } from '../task-overview/task-overview.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { MemberService } from '../../services/member.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { ProjectServiceGet } from '../../services/project.service';
import { Project } from '../../models/project';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { taskPriority } from '../../models/taskPriority';
import { switchMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {HasGlobalPermissionPipe} from "../../pipes/has-global-permission.pipe";
import {GlobalPermission} from "../../enums/global-permissions.enum";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-member-overview',
  standalone: true,
  templateUrl: './member-overview.component.html',
  styleUrl: './member-overview.component.scss',
  imports: [
    CommonModule,
    TaskOverviewComponent,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    MatPaginator,
    MatDivider,
    MatTableModule,
    HasGlobalPermissionPipe,
  ],
})
export class MemberOverviewComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  authMemberId: number = 0;
  routeSub: any;
  tasks: Task[] = []; // Vaši zadaci
  startIndex = 0;

  dataSource = new MatTableDataSource<Task>([]);
  displayedColumns: string[] = [
    'project',
    'task',
    'dueDate',
    'status',
    'priority',
    'actions',
  ];

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private mService: MemberService,
    private tService: TaskService,
    private pService: ProjectServiceGet,
    private authService: AuthService
  ) {}


  member: Member = {
    checked: undefined,
    isDisabled: false,
    id: -1,
    firstName: '',
    lastName: '',
    email: '',
    roleId: 1,
    roleName: '',
    dateAdded: new Date(1, 2, 3),
    country: '',
    city: '',
    github: '',
    dateOfBirth: new Date(1, 2, 3),
    linkedin: '',
    status: '',
    phoneNumber: '',
    numberOfTasks: 0,
  };

  p?: Project;
  projects: Project[] = [];

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.member.id = params['id'];
          return this.mService.getMemberById(this.member.id);
        }),
        switchMap((member) => {
          this.member = member;
          return this.tService.getTasksByMember(this.member.id);
        }),
        switchMap((tasks) => {
          this.tasks = tasks;
          const observables = this.tasks.map((task) => {
            const projectObservable = this.pService.getProjectById(
              task.projectId
            );
            const taskPriorityObservable = this.tService.getTaskPriority(
              task.taskPriorityId
            );
            return forkJoin([projectObservable, taskPriorityObservable]);
          });
          return forkJoin(observables);
        })
      )
      .subscribe((results) => {
        results.forEach((result, index) => {
          this.tasks[index].projectName = result[0].projectName;
          this.tasks[index].taskPriorityName = result[1].name;
        });
        this.dataSource = new MatTableDataSource(this.tasks);
        this.dataSource.paginator = this.paginator;
      });

    this.authMemberId = Number(this.authService.getAuthenticatedMembersId());
  }

  //////////////////////////////////////////////////////
  openDialog(task: Task) {

    const dialogRef = this.dialog.open(TaskOverviewComponent, {
      width: '1200px',
      height : '700px',
      data: task
    });

    dialogRef.componentInstance.taskModified.subscribe(() => {
      this.ngOnInit()
    });
  }


  protected readonly environment = environment;
  protected readonly GlobalPermission = GlobalPermission;
  protected readonly Date = Date;
}
