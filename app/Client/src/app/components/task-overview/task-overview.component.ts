import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { taskActivity } from '../../models/taskActivity';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Task } from '../../models/task';
import { NgxEditorModule } from 'ngx-editor';
import { TaskService } from '../../services/task.service';
import { NgToastModule } from 'ng-angular-popup';
import { MemberService } from '../../services/member.service';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem } from '@angular/material/menu';
import { ProjectServiceGet } from '../../services/project.service';
import { environment } from '../../../environments/environment';
import { forkJoin, switchMap } from 'rxjs';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { MatOption, MatSelect } from '@angular/material/select';
import { taskComment } from '../../models/taskComment';
import { Permission } from '../../models/permission';
import { ProjectPermission } from '../../enums/project-permissions.enum';
import { HasProjectPermissionPipe } from '../../pipes/has-project-permission.pipe';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { TaskStatus } from '../../models/task-status';
import { taskPriority } from '../../models/taskPriority';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Member } from '../../models/member';
import { Role } from '../../models/role';
import { SignalRService } from '../../services/signal-r.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { PermissionService } from '../../services/permission.service';
import { TaskFilesComponent } from '../task-files/task-files.component';
import { taskCategory } from '../../models/taskCategory';
import { IsAssignedToTask } from '../../pipes/assigned-to-task.pipe';

@Component({
  selector: 'app-task-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxEditorModule,
    NgToastModule,
    NgToastModule,
    MatButton,
    MatMenu,
    MatMenuItem,
    MatAnchor,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCheckbox,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatListItem,
    MatNavList,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatTab,
    MatTabGroup,
    MatToolbar,
    ReactiveFormsModule,
    MatButtonToggle,
    MatSelect,
    MatOption,
    MatCardFooter,
    HasProjectPermissionPipe,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatHint,
    MatSuffix,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatTable,
    MatHeaderCellDef,
    AvatarComponent,
    NgOptimizedImage,
    MatNoDataRow,
    TaskFilesComponent,
    IsAssignedToTask,
  ],
  templateUrl: './task-overview.component.html',
  styleUrl: './task-overview.component.scss',
})
export class TaskOverviewComponent implements OnInit, DoCheck {
  loggedUserId: any;
  project: any;
  description: any;
  show: any;
  allTypes: any;
  selectedStatus: any;
  selectedPriority: any;
  today: Date = new Date();
  protected readonly environment = environment;
  @Output() taskModified: EventEmitter<any> = new EventEmitter<any>();
  taskLeaderId: any;
  waiting: boolean = false;
  @ViewChild(MatSort) sort: any;
  @ViewChild(MatPaginator) paginator: any;
  @ViewChild(MatSort) sort1: any;
  @ViewChild(MatPaginator) paginator1: any;
  @ViewChild(MatSort) sort2: any;
  @ViewChild(MatPaginator) paginator2: any;
  onlineAssignees: Set<number> = new Set<number>();

  taskActivityGroup!: FormGroup;
  taskActivityComment!: FormGroup;
  taskNameForm!: FormGroup;
  taskDescriptionForm!: FormGroup;
  taskLeaderFormGroup!: FormGroup;
  addChildTasksForm!: FormGroup;
  taskInfoForm!: FormGroup;
  taskCategoryForm!: FormGroup;
  taskNewCategoryForm!: FormGroup;

  taskComments: taskComment[] = [];
  permissions: Permission[] = [];
  taskStatuses: TaskStatus[] = [];
  activitiesForThisTask: taskActivity[] = [];
  activities: taskActivity[] = [];
  taskPriorities: taskPriority[] = [];
  membersOnThisTask: Member[] = [];
  allMembersOnProject: Member[] = [];
  projectRoles: Role[] = [];
  tasksOnThisProject: Task[] = [];
  taskCategories: taskCategory[] = [];
  makeCategory: boolean = false;
  permission : any

  readonly ProjectPermission = ProjectPermission;
  @ViewChild('scrollableDiv') private scrollableDiv!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<TaskOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public task: Task,
    private tService: TaskService,
    private mService: MemberService,
    private pService: ProjectServiceGet,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private _liveAnnouncer: LiveAnnouncer,
    private _liveAnnouncer1: LiveAnnouncer,
    private signalRService: SignalRService,
    private permService: PermissionService
  ) {}

  ngDoCheck(): void {
    if (this.scrollableDiv != undefined)
      this.scrollableDiv.nativeElement.scrollTop =
        this.scrollableDiv.nativeElement.scrollHeight;
  }

  ngOnInit() {
    const permissions = this.permService.getProjectPermissions(
      this.task.projectId
    );

    const assignedTasks = this.permService.getProjectTaskIds(
      this.task.projectId
    );

    this.loggedUserId = localStorage.getItem('authenticated-member-id');
    this.fetchTaskCategories();
    this.fetchTaskActivityStatuses();
    this.fetchTaskActivities();
    this.fetchTaskStatuses();
    this.fetchTaskComments();
    this.fetchTaskPriorityStatuses();
    this.fetchTasksDependOnThisTask();
    this.fetchMembersOnTask();
    this.fetchTasksOnThisProject();

    this.signalRService.getConnectedMemberIds().subscribe({
      next: (data) => {
        this.onlineAssignees = data;
      },
      error: (err) => {
        console.log('failed fetching online members');
      },
    });

    this.pService.getAllProjectRoles(this.task.projectId).subscribe({
      next: (data) => {
        this.projectRoles = data;
      },
      error: (err) => {
        console.log('failed fetching project roles');
      },
    });

    this.taskInfoForm = this.fb.group({
      startDate: [
        {
          value: new Date(this.task.startDate),

          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
      deadline: [
        {
          value: new Date(this.task.deadline),

          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
      taskDescription: [
        {
          value: this.task.taskDescription,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
      taskName: [
        {
          value: this.task.taskName,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
      taskStatusId: [
        {
          value: this.task.taskStatusId,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK_STATUS),
        },
        Validators.required,
      ],
      taskPriorityId: [
        {
          value: this.task.taskPriorityId,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK_PRIORITY),
        },
        Validators.required,
      ],
    });

    this.addChildTasksForm = this.fb.group({
      dependentTaskId: [
        {
          value: '',
          disabled: !permissions.has(ProjectPermission.ADD_TASK_DEPENDENCY),
        },
        Validators.required,
      ],
      taskId: [this.task.taskId],
    });

    this.taskLeaderFormGroup = this.fb.group({
      taskId: [this.task.taskId],
      newTaskLeaderId: [
        {
          value: '',
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
    });

    this.taskActivityGroup = this.fb.group({
      description: [
        {
          value: '',
          disabled: (!permissions.has(ProjectPermission.ADD_TASK_ACTIVITY) && !assignedTasks.has(this.task.taskId)) || this.task.percentageComplete == 100,
        },
        Validators.required,
      ],
      percentageComplete: [
        {
          value: '',
          disabled: (!permissions.has(ProjectPermission.ADD_TASK_ACTIVITY) && !assignedTasks.has(this.task.taskId)) || this.task.percentageComplete == 100,
        },
        [
          Validators.required,
          Validators.min(1),
          Validators.max(100 - this.task.percentageComplete),
          Validators.pattern('^(100|[1-9]?[0-9])$'),
        ],
      ],
      taskActivityTypeId: [
        {
          value: '',
          disabled: (!permissions.has(ProjectPermission.ADD_TASK_ACTIVITY) && !assignedTasks.has(this.task.taskId)) || this.task.percentageComplete == 100,
        },
        Validators.required,
      ],
      taskId: [this.task.taskId],
    });

    this.taskNameForm = this.fb.group({
      deadline: [this.task.deadline],
      taskDescription: [this.task.taskDescription],
      taskName: [
        {
          value: this.task.taskName,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
    });

    this.taskDescriptionForm = this.fb.group({
      deadline: [this.task.deadline],
      taskDescription: [
        {
          value: this.task.taskDescription,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK),
        },
        Validators.required,
      ],
      taskName: [this.task.taskName],
    });

    this.taskActivityComment = this.fb.group({
      taskId: [this.task.taskId],
      text: [
        {
          value: '',
          disabled: !permissions.has(ProjectPermission.COMMENT_TASK) && !assignedTasks.has(this.task.taskId),
        },
        Validators.required,
      ],
    });

    this.taskCategoryForm = this.fb.group({
      taskCategoryId: [
        {
          value: this.task.taskCategoryId,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK_CATEGORY),
        },
        Validators.required,
      ],
      taskCategoryName: [
        {
          value: this.task.taskCategoryName,
          disabled: !permissions.has(ProjectPermission.CHANGE_TASK_CATEGORY),
        },
        Validators.required,
      ],
    });

    this.taskNewCategoryForm = this.fb.group({
      taskCategoryName: [
        {
          value: '',
          disabled: !permissions.has(ProjectPermission.ADD_TASK_CATEGORY),
        },
        Validators.required,
      ],
    });

    this.show = 'overview';
  } //NGONINITEND

  fetchTaskActivityStatuses() {
    this.tService.getTaskActivityType().subscribe((data) => {
      this.allTypes = data;
    });
  }

  fetchTaskStatuses() {
    this.pService
      .getAllTaskStatusesOnProject(this.task.projectId)
      .subscribe((statuses: TaskStatus[]) => {
        this.taskStatuses = statuses;
      });
  }

  fetchTasksOnThisProject() {
    this.tService
      .getTasksByProject(this.task.projectId)
      .subscribe((tasks: Task[]) => {
        this.tasksOnThisProject = tasks;
      });
  }

  fetchTaskActivities(): void {
    this.tService
      .getTaskActivitiesById(this.task.taskId)
      .pipe(
        switchMap((taskActivities) => {
          this.activities = taskActivities;
          this.activitiesForThisTask = [];

          const observables = [];

          for (let i = 0; i < taskActivities.length; i++) {
            const memberObservable = this.mService.getMemberById(
              this.activities[i].workerId
            );
            const taskObservable = this.tService.getTaskActivityName(
              this.activities[i].taskActivityTypeId
            );

            observables.push(memberObservable);
            observables.push(taskObservable);
          }

          return forkJoin(observables).pipe(
            switchMap((results: any) => {
              // Use results to update tasks
              for (let i = 0; i < taskActivities.length; i++) {
                if (this.activities[i].taskId == this.task.taskId) {
                  this.activities[i].differenceH = Math.trunc(
                    (new Date().getTime() -
                      new Date(this.activities[i].dateModify).getTime()) /
                      (1000 * 3600)
                  );
                  this.activities[i].differenceM = Math.trunc(
                    (new Date().getTime() -
                      new Date(this.activities[i].dateModify).getTime()) /
                      (1000 * 60)
                  );

                  const memberIndex = i * 2;
                  this.activities[i].memberName =
                    results[memberIndex].firstName +
                    ' ' +
                    results[memberIndex].lastName;

                  const taskActivityIndex = memberIndex + 1;
                  this.activities[i].taskActivityName =
                    results[taskActivityIndex].taskActivityTypeName;

                  this.activitiesForThisTask.push(this.activities[i]);
                }
              }
              return this.activities;
            })
          );
        })
      )
      .subscribe();
  }

  fetchTaskComments() {
    this.tService
      .getTaskCommentsByTaskId(this.task.taskId)
      .subscribe((data: taskComment[]) => {
        this.taskComments = data;
      });
  }

  fetchTaskPriorityStatuses() {
    this.tService
      .getTaskPriorities()
      .subscribe((priorities: taskPriority[]) => {
        this.taskPriorities = priorities;

        console.log(this.taskPriorities);
      });
  }

  updateTaskInfo() {
    this.tService.getTaskById(this.task.taskId).subscribe((task: Task) => {
      this.task = task;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveActivity() {
    if (this.taskActivityGroup.valid) {
      const permissions = this.permService.getProjectPermissions(
        this.task.projectId
      );
      const assignedTasks = this.permService.getProjectTaskIds(
        this.task.projectId
      );
      const taskActivity = this.taskActivityGroup.value;
      console.log(taskActivity);

      this.tService.saveTaskActivity(taskActivity).subscribe({
        next: (next) => {
          this.fetchTaskActivities();
          this.tService
            .getTaskById(this.task.taskId)
            .subscribe((task: Task) => {
              this.task = task;
              this.snackBar.open('Successfully added task activity!', 'Close', {
                duration: 3000,
              });

              const toDisable = ((!permissions.has(ProjectPermission.ADD_TASK_ACTIVITY) && !assignedTasks.has(task.taskId)) || task.percentageComplete == 100)

              if(toDisable)
              {
                this.taskActivityGroup.get("percentageComplete")?.disable()
                this.taskActivityGroup.get("taskActivityTypeId")?.disable()
                this.taskActivityGroup.get("description")?.disable()
              }
              else
              {
                this.taskActivityGroup.get("percentageComplete")?.enable()
                this.taskActivityGroup.get("taskActivityTypeId")?.enable()
                this.taskActivityGroup.get("description")?.enable()
              }

              this.taskActivityGroup.get("taskActivityTypeId")?.setValue("")
              this.taskActivityGroup.get("taskActivityTypeId")?.setErrors(null)

              this.taskActivityGroup.get("description")?.setValue("")
              this.taskActivityGroup.get("description")?.setErrors(null)

              this.taskActivityGroup.get("percentageComplete")?.setValue("")
              this.taskActivityGroup.get("percentageComplete")?.setErrors(null)
              this.taskActivityGroup.get("percentageComplete")?.setValidators([
                Validators.required,
                Validators.min(1),
                Validators.max(100 - this.task.percentageComplete),
                Validators.pattern('^(100|[1-9]?[0-9])$'),
              ]);

              this.taskModified.emit();

            });
        },
        error: (error) => {
          console.log(error);
          this.snackBar.open('Failed to add task activity!', 'Close', {
            duration: 3000,
          });
        },
      });
    } else this.taskActivityGroup.markAllAsTouched();
  }

  deleteTaskActivity(taskAct: taskActivity) {
    const permissions = this.permService.getProjectPermissions(
      this.task.projectId
    );
    const assignedTasks = this.permService.getProjectTaskIds(
      this.task.projectId
    );
    this.tService.deleteTaskActivity(taskAct.taskActivityId).subscribe({
      next: (data) => {
        this.snackBar.open('Sucessfully deleted task activity!', 'Close', {
          duration: 3000,
        });
        this.tService.getTaskById(this.task.taskId).subscribe((task: Task) => {
          this.task = task;
          const toDisable = ((!permissions.has(ProjectPermission.ADD_TASK_ACTIVITY) && !assignedTasks.has(task.taskId)) || task.percentageComplete == 100)



          if(toDisable)
          {
            this.taskActivityGroup.get("percentageComplete")?.disable()
            this.taskActivityGroup.get("taskActivityTypeId")?.disable()
            this.taskActivityGroup.get("description")?.disable()
          }
          else
          {
            this.taskActivityGroup.get("percentageComplete")?.enable()
            this.taskActivityGroup.get("taskActivityTypeId")?.enable()
            this.taskActivityGroup.get("description")?.enable()
          }

          this.taskActivityGroup.get("taskActivityTypeId")?.setValue("")
          this.taskActivityGroup.get("taskActivityTypeId")?.setErrors(null)

          this.taskActivityGroup.get("description")?.setValue("")
          this.taskActivityGroup.get("description")?.setErrors(null)

          this.taskActivityGroup.get("percentageComplete")?.setValue("")
          this.taskActivityGroup.get("percentageComplete")?.setErrors(null)
          this.taskActivityGroup.get("percentageComplete")?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(100 - this.task.percentageComplete),
            Validators.pattern('^(100|[1-9]?[0-9])$'),
          ]);

          this.taskModified.emit();
        });
        this.fetchTaskActivities();
      },
      error: (error) => {
        this.snackBar.open('Failed to delete task activity!', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  saveComment() {
    if (this.taskActivityComment.valid) {
      const taskComment = this.taskActivityComment.value;
      this.tService.saveTaskComment(taskComment).subscribe({
        next: (data) => {
          this.taskActivityComment.get("text")?.setValue("")
          this.taskActivityComment.get("text")?.setErrors(null)
          this.fetchTaskComments();
        },
        error: (error) => {
          this.snackBar.open('Failed to add task comment!', 'Close', {
            duration: 3000,
          });
          console.log(error);
        },
      });
    } else this.taskActivityComment.markAllAsTouched();
  }

  editTaskname() {
    if (this.taskNameForm.valid) {
      const taskData = this.taskNameForm.value;
      console.log(taskData);
      this.tService
        .changeTaskNameDescriptionDeadline(this.task.taskId, taskData)
        .subscribe({
          next: (data) => {
            this.updateTaskInfo();
            this.snackBar.open('Successfully changed task info!', 'Close', {
              duration: 3000,
            });
            this.taskModified.emit();
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Failed to change task info!', 'Close', {
              duration: 3000,
            });
          },
        });
    } else this.taskNameForm.markAllAsTouched();
  }

  editTaskdescription() {
    if (this.taskDescriptionForm.valid) {
      const taskData = this.taskDescriptionForm.value;
      console.log(taskData);
      this.tService
        .changeTaskNameDescriptionDeadline(this.task.taskId, taskData)
        .subscribe({
          next: (data) => {
            this.updateTaskInfo();
            this.snackBar.open('Successfully changed task info!', 'Close', {
              duration: 3000,
            });
            this.taskModified.emit();
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Failed to change task info!', 'Close', {
              duration: 3000,
            });
          },
        });
    } else this.taskDescriptionForm.markAllAsTouched();
  }

  search(event: any): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  search1(event: any): void {
    this.dataSourceTaskDependsOn.filter = (
      event.target as HTMLInputElement
    ).value
      .trim()
      .toLowerCase();
  }

  announceSortChange1(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer1.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer1.announce('Sorting cleared');
    }
  }

  isMemberTeamLeader(mId: number): boolean {
    if (mId === this.taskLeaderId) return true;
    return false;
  }

  assignRemove(event: any, memberId: number) {
    console.log(event);
    const membersList = [memberId];

    if (event) {
      // assign
      this.waiting = true;
      this.tService
        .assignMembersToTask(this.task.taskId, membersList)
        .subscribe({
          next: (data) => {
            this.snackBar.open(
              'Successfully assigned member to task!',
              'Close',
              { duration: 3000 }
            );
            this.waiting = false;
            this.fetchMembersOnTask();
          },
          error: (error) => {
            this.snackBar.open('Failed assigning member to task!', 'Close', {
              duration: 3000,
            });
            this.waiting = false;
          },
        });
    } //remove
    else {
      this.waiting = true;
      this.tService
        .removeMembersFromTask(this.task.taskId, memberId)
        .subscribe({
          next: (data) => {
            this.snackBar.open(
              'Successfully unassigned member from task!',
              'Close',
              { duration: 3000 }
            );
            this.waiting = false;
            this.fetchMembersOnTask();
          },
          error: (error) => {
            this.snackBar.open(
              'Failed unassigning member from task!',
              'Close',
              { duration: 3000 }
            );
            this.waiting = false;
          },
        });
    }
  }
  dataSource: any;
  displayedColumns = ['assigned', 'avatar', 'name', 'projectRole', 'email'];

  fetchMembersOnTask() {
    this.tService.getTaskById(this.task.taskId).subscribe((data: Task) => {
      this.taskLeaderId = data.taskLeaderId;
      this.membersOnThisTask = data.assignedMembers;
      this.pService
        .getMembersByProjectId(this.task.projectId)
        .subscribe((members2: Member[]) => {
          this.allMembersOnProject = members2;
          this.dataSource = new MatTableDataSource(this.allMembersOnProject);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
    });
  }

  isMemberOnTask(memberId: number): boolean {
    for (let i = 0; i < this.membersOnThisTask.length; i++) {
      if (memberId === this.membersOnThisTask[i].id) return true;
    }
    return false;
  }

  isTaskInsideTable(taskId: number): boolean {
    for (let i = 0; i < this.tasksDependsOnThisTask.length; i++) {
      if (this.tasksDependsOnThisTask[i].taskId == taskId) return true;
    }
    return false;
  }

  editTaskLeader() {
    if (this.taskLeaderFormGroup.valid) {
      const taskData = this.taskLeaderFormGroup.value;
      this.tService
        .assignNewTaskLeader(this.task.taskId, taskData.newTaskLeaderId)
        .subscribe({
          next: (data) => {
            this.updateTaskInfo();
            this.snackBar.open('Successfully changed task leader!', 'Close', {
              duration: 3000,
            });
            this.taskModified.emit();
            this.fetchMembersOnTask();
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Failed to change task leader!', 'Close', {
              duration: 3000,
            });
          },
        });
    } else this.taskLeaderFormGroup.markAllAsTouched();
  }

  tasksDependsOnThisTask: Task[] = [];
  displayedColumnsTaskDependsOn: string[] = [
    'task name',
    'start date',
    'due date',
    'status',
    'priority',
    'task leader',
    'remove',
  ];
  dataSourceTaskDependsOn: any;

  fetchTasksDependOnThisTask() {
    this.tService
      .getTasksDependentOnTaskId(this.task.taskId)
      .subscribe((tasks: Task[]) => {
        this.tasksDependsOnThisTask = tasks;
        this.dataSourceTaskDependsOn = new MatTableDataSource(
          this.tasksDependsOnThisTask
        );
        this.dataSourceTaskDependsOn.sort = this.sort1;
        this.dataSourceTaskDependsOn.paginator = this.paginator1;
      });
  }

  addChildTask() {
    if (this.addChildTasksForm.valid) {
      const taskData = this.addChildTasksForm.value;
      this.tService
        .addTaskDependency(this.task.taskId, taskData.dependentTaskId)
        .subscribe({
          next: (data) => {
            this.snackBar.open('Successfully added task dependency!', 'Close', {
              duration: 3000,
            });
            this.taskModified.emit();
            this.fetchTasksDependOnThisTask();
            this.addChildTasksForm.get('dependentTaskId')?.reset('');
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Failed to add task dependency!', 'Close', {
              duration: 3000,
            });
          },
        });
    } else this.addChildTasksForm.markAllAsTouched();
  }

  deleteChildTask(childTaskId: number) {
    this.tService
      .removeTaskDependency(this.task.taskId, childTaskId)
      .subscribe({
        next: (data) => {
          this.snackBar.open('Successfully removed task dependency!', 'Close', {
            duration: 3000,
          });
          this.taskModified.emit();
          this.fetchTasksDependOnThisTask();
        },
        error: (error) => {
          console.log(error);
          this.snackBar.open('Failed to remove task dependency!', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  editTaskInfo() {
    if (this.taskInfoForm.valid) {
      const taskData = this.taskInfoForm.value;
      console.log(this.taskInfoForm.value);
      const utcDate1 = new Date(
        Date.UTC(
          this.taskInfoForm.value.deadline.getFullYear(),
          this.taskInfoForm.value.deadline.getMonth(),
          this.taskInfoForm.value.deadline.getDate()
        )
      );
      this.taskInfoForm.value.deadline = utcDate1;

      const utcDate2 = new Date(
        Date.UTC(
          this.taskInfoForm.value.startDate.getFullYear(),
          this.taskInfoForm.value.startDate.getMonth(),
          this.taskInfoForm.value.startDate.getDate()
        )
      );
      this.taskInfoForm.value.startDate = utcDate2;
      this.tService
        .updateTaskInfo(this.task.taskId, this.taskInfoForm.value)
        .subscribe({
          next: (data) => {
            this.snackBar.open('Successfully changed task info!', 'Close', {
              duration: 3000,
            });
            this.taskModified.emit();
            this.tService
              .getTaskById(this.task.taskId)
              .subscribe((task: Task) => {
                this.task = task;
              });
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Failed to change task info!', 'Close', {
              duration: 3000,
            });
          },
        });
    } else this.taskInfoForm.markAllAsTouched();
  }

  fetchTaskCategories() {
    this.tService
      .getTaskCategoriesOnProject(this.task.projectId)
      .subscribe((data: taskCategory[]) => {
        this.taskCategories = data;
        console.log(this.taskCategories);
      });
  }

  makeNewCategory(id: number) {
    if (id == -1) this.makeCategory = true;
    else this.makeCategory = false;
  }

  addNewCategory() {
    if (this.taskNewCategoryForm.valid) {
      this.tService
        .addTaskCategory(this.task.projectId, this.taskNewCategoryForm.value)
        .subscribe({
          next: (data) => {
            this.snackBar.open('Successfully added new category!', 'Close', {
              duration: 3000,
            });
            this.taskModified.emit();
            this.fetchTaskCategories();
            this.makeCategory = false;
          },
          error: (error) => {
            console.log(error);
            this.snackBar.open('Failed to add new category!', 'Close', {
              duration: 3000,
            });
          },
        });
    } else this.taskNewCategoryForm.markAllAsTouched();
  }

  changeTaskCategory(event: any) {
    if (event.value != -1) {
      this.tService.changeTaskCategoy(this.task.taskId, event.value).subscribe({
        next: (data) => {
          this.snackBar.open('Successfully changed task category!', 'Close', {
            duration: 3000,
          });
          this.taskModified.emit();
          this.fetchTaskCategories();
          this.makeCategory = false;
        },
        error: (error) => {
          console.log(error);
          this.snackBar.open('Failed to change task category!', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  deleteCategory(tackCategoryID: string, event: any) {
    event.stopPropagation();
    console.log(tackCategoryID);
    this.tService
      .deleteTaskCategory(this.task.projectId, Number(tackCategoryID))
      .subscribe({
        next: (data) => {
          this.fetchTaskCategories();
          this.snackBar.open('Sucessfully deleted task category!', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          this.snackBar.open(
            'Failed to delete task category! Another task is in this category!',
            'Close',
            {
              duration: 3000,
            }
          );
        },
      });
  }
}
