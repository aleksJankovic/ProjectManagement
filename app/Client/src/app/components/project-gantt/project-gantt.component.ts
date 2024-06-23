import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  GANTT_GLOBAL_CONFIG,
  GanttBarClickEvent,
  GanttDragEvent,
  GanttGroup,
  GanttItem,
  GanttLineClickEvent,
  GanttLinkDragEvent,
  GanttLinkLineType,
  GanttSelectedEvent,
  GanttViewType,
  NgxGanttComponent,
  NgxGanttTableColumnComponent,
  NgxGanttTableComponent,
} from '@worktile/gantt';
import { enUS } from 'date-fns/locale';
import { DatePipe, NgForOf, NgIf, NgStyle } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { switchMap } from 'rxjs/operators';
import { Task } from '../../models/task';
import { combineLatest, forkJoin, map } from 'rxjs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatDialog } from '@angular/material/dialog';
import { TaskOverviewComponent } from '../task-overview/task-overview.component';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddTaskComponent } from '../add-task/add-task.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { taskPriority } from '../../models/taskPriority';
import { MatDivider } from '@angular/material/divider';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { TaskStatus } from '../../models/task-status';
import { HasProjectPermissionPipe } from '../../pipes/has-project-permission.pipe';
import { ProjectPermission } from '../../enums/project-permissions.enum';
import { Permission } from '../../models/permission';
import {
  ganttUpdater,
  PermissionService,
} from '../../services/permission.service';
import { Project } from '../../models/project';
import { ProjectServiceGet } from '../../services/project.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-project-gantt',
  standalone: true,
  imports: [
    NgxGanttComponent,
    NgxGanttTableColumnComponent,
    NgxGanttTableComponent,
    DatePipe,
    NgIf,
    MatButton,
    NgForOf,
    MatRadioButton,
    MatRadioGroup,
    FormsModule,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatDivider,
    MatOption,
    MatSelect,
    NgStyle,
    HasProjectPermissionPipe,
    MatIconButton,
    MatMenuModule,
  ],
  templateUrl: './project-gantt.component.html',
  styleUrl: './project-gantt.component.scss',
  providers: [
    {
      provide: GANTT_GLOBAL_CONFIG,
      useValue: {
        dateFormat: {
          yearQuarter: `QQQ 'of' yyyy`,
          month: 'LLLL',
          week: `LLLL`,
          yearWeek: 'LLLL',
          yearMonth: `LLLL yyyy`,
          year: 'yyyy',
          locale: enUS,
        },
        linkOptions: {
          lineOption: GanttLinkLineType.straight,
          showArrow: true,
        },
      },
    },
  ],
})
export class ProjectGanttComponent implements OnInit, OnDestroy {
  projectId: any;
  tasks: any;
  taskCategories: any;
  taskPriorities!: taskPriority[];
  taskStatuses!: TaskStatus[];
  ganttGroups: GanttGroup[] = [];
  ganttItems: GanttItem[] = [];
  defaultStatus: number = 0;
  selectedStatus: number = 0;
  defaultPriority: number = 0;
  selectedPriority: number = 0;
  searchedTerm: string = '';
  private currentBuffer: number = 0;
  private bufferIncrement: number = 10000;
  private originalGanttItems: any = [];
  private routeSubscription: any;

  @ViewChild('gantt') ganttComponent: any;

  views = [
    {
      name: 'Day',
      value: GanttViewType.day,
    },
    {
      name: 'Week',
      value: GanttViewType.week,
    },
    {
      name: 'Month',
      value: GanttViewType.month,
    },
  ];

  viewType: GanttViewType = GanttViewType.day;
  selectedViewType: GanttViewType = GanttViewType.day;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private permissionService: PermissionService,
    private projectService: ProjectServiceGet
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.params
      .pipe(
        switchMap((params) => {
          const projectId = params['id'];
          this.projectId = projectId;

          const tasks$ = this.taskService.getTasksByProject(projectId);
          const taskCategories$ = this.taskService.getTaskCategories(projectId);

          return combineLatest([tasks$, taskCategories$]).pipe(
            switchMap(([tasks, taskCategories]) => {
              const dependentTasksObservables = tasks.map((task) =>
                this.taskService.getDependantTasks(task.taskId)
              );

              return forkJoin(dependentTasksObservables).pipe(
                map((dependentTasksArray) => {
                  // Map the dependentTasksArray to the tasks
                  tasks.forEach((task, index) => {
                    task.dependentTasks = dependentTasksArray[index];
                  });
                  return { tasks, taskCategories };
                })
              );
            })
          );
        })
      )
      .subscribe({
        next: ({ tasks, taskCategories }) => {
          this.tasks = tasks;
          this.taskCategories = taskCategories;
          this.mapTasksToGanttItems(false);
        },
        error: (error) => {
          console.log(
            `Failed fetching tasks for project with id ${this.projectId}`
          );
        },
      });

    this.taskService.getTaskPriorities().subscribe({
      next: (data: taskPriority[]) => {
        this.taskPriorities = data;
      },
      error: (error) => {
        console.log('failed fetching task priorities');
      },
    });

    this.taskService.getTaskStatusesByProject(this.projectId).subscribe({
      next: (data: TaskStatus[]) => {
        this.taskStatuses = data;
      },
      error: (err) => {
        console.log('failed fetching task statuses');
      },
    });

    ganttUpdater.subscribe((response) => {
      this.currentBuffer += this.bufferIncrement;
      this.mapTasksToGanttItems(false);
      console.log(
        `refreshing gantt page because of permission update! (buffer state: ${this.currentBuffer}`
      );
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  search(event: Event): void {
    this.searchedTerm = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.applyFilters();
  }

  private mapTasksToGanttItems(changeView: boolean = true): void {
    this.ganttGroups = this.taskCategories.map(
      (category: { taskCategoryID: any; categoryName: any }) => {
        return {
          id: String(category.taskCategoryID),
          title: category.categoryName,
          expanded: true,
        };
      }
    );

    const projectPermissions: Set<number> =
      this.permissionService.getProjectPermissions(this.projectId);

    this.originalGanttItems = this.tasks.map((task: Task) => {
      const dependentTaskIds =
        task.dependentTasks?.map((depTask: { taskId: any }) =>
          String(depTask.taskId + this.currentBuffer)
        ) || [];
      const links = dependentTaskIds.length ? dependentTaskIds : undefined;

      return {
        id: String(task.taskId + this.currentBuffer),
        group_id: String(task.taskCategoryId),
        title: task.taskName,
        start: new Date(task.startDate).getTime(),
        end: new Date(task.deadline).getTime(),
        color: '#3F51B5',
        barStyle: {
          border: '1px solid black',
        },
        links: links,
        progress: task.taskStatusId === 3 ? 0 : -1, // Call your progress calculation method,
        draggable:
          task.taskStatusId !== 3 &&
          projectPermissions.has(ProjectPermission.CHANGE_TASK),
        linkable:
          task.taskStatusId !== 3 &&
          projectPermissions.has(ProjectPermission.ADD_TASK_DEPENDENCY),
        taskStatusId: task.taskStatusId,
        taskPriorityId: task.taskPriorityId,
        taskStatusName: task.taskStatus,
        taskPriorityName: task.taskPriorityName,
        taskPriorityColor: this.taskPriorities.find(
          (tp: taskPriority) => tp.taskPriorityId == task.taskPriorityId
        )?.color,
      };
    });

    this.ganttItems = this.originalGanttItems;
    this.applyFilters(changeView);

    console.log('mapped all taks to gantt items');
  }

  scrollToToday() {
    this.ganttComponent.scrollToToday();
  }

  selectView(type: GanttViewType) {
    this.viewType = type;
    this.selectedViewType = type;

    this.scrollToToday();
  }

  selectedChange(event: GanttSelectedEvent) {
    event.current && this.ganttComponent.scrollToDate(event.current?.start);
  }

  barClick($event: GanttBarClickEvent) {
    this.openTaskOverview(Number($event.item.id) - this.currentBuffer);
  }

  openTaskOverview(taskId: number): void {
    const task = this.tasks.find((task: Task) => task.taskId == taskId);

    this.projectService
      .getProjectById(task.projectId)
      .subscribe((project: Project) => {
        task.projectName = project.projectName;
      });

    const dialogRef = this.matDialog.open(TaskOverviewComponent, {
      width: '1200px',
      height: '700px',
      data: task,
    });

    dialogRef.componentInstance.taskModified.subscribe(() => {
      this.ngOnInit();
    });
  }

  openAddTask() {
    const dialogRef = this.matDialog.open(AddTaskComponent, {
      width: '500px',
      data: { projectId: this.projectId },
    });

    dialogRef.componentInstance.taskAdded.subscribe(() => {
      this.ngOnInit();
    });
  }

  oldStart: any;
  oldEnd: any;

  dragStarted(event: GanttDragEvent<unknown>) {
    if (event.item.id && event.item.start && event.item.end) {
      this.oldStart = event.item.start;
      this.oldEnd = event.item.end;
    }
  }

  dragEnded(event: GanttDragEvent) {
    if (event.item.id && event.item.start && event.item.end) {
      const taskId = Number(event.item.id) - this.currentBuffer;

      const startTimestamp = event.item.start * 1000;
      const endTimestamp = event.item.end * 1000;

      // Create UTC dates
      const startDate = new Date(startTimestamp);
      const endDate = new Date(endTimestamp);
      endDate.setSeconds(0);
      endDate.setMinutes(0);
      endDate.setHours(0);

      if (startDate > endDate) {
        const task = this.tasks.find((tp: Task) => tp.taskId === taskId);
        task.startDate = this.oldStart;
        task.deadline = this.oldEnd;

        this.mapTasksToGanttItems(false);

        this.snackBar.open('Failed changing task date!', 'Close', {
          duration: 1500,
        });

        return;
      }

      this.taskService.changeTaskDates(taskId, startDate, endDate).subscribe({
        next: (data) => {
          const task = this.tasks.find((tp: Task) => tp.taskId === taskId);
          task.startDate = startDate;
          task.deadline = endDate;

          this.mapTasksToGanttItems(false);

          this.snackBar.open('Successfully changed task date!', 'Close', {
            duration: 1500,
          });
        },
        error: (error) => {
          const task = this.tasks.find((tp: Task) => tp.taskId === taskId);
          task.startDate = this.oldStart;
          task.deadline = this.oldEnd;
          this.mapTasksToGanttItems(false);
          this.snackBar.open('Failed changing task date!', 'Close', {
            duration: 1500,
          });
        },
      });
    }
  }

  linkEnded(event: GanttLinkDragEvent) {
    if (event.source && event.target) {
      const taskId = Number(event.source.id) - this.currentBuffer;
      const dTaskId = Number(event.target.id) - this.currentBuffer;

      this.taskService.addTaskDependency(taskId, dTaskId).subscribe({
        next: (data) => {
          const taskToAddDependencyTo = this.tasks.find(
            (task: Task) => task.taskId === taskId
          );
          if (taskToAddDependencyTo) {
            taskToAddDependencyTo.dependentTasks.push({ taskId: dTaskId });
          }

          this.mapTasksToGanttItems(false);

          this.snackBar.open('Successfully added dependency!', 'Close', {
            duration: 1500,
          });
        },
        error: (error) => {
          this.snackBar.open('Failed adding dependency', 'Close', {
            duration: 1500,
          });
        },
      });
    }
  }

  onStatusFilterChange(event: any) {
    this.selectedStatus = event;
    this.applyFilters();
  }

  onPriorityFilterChange(event: any) {
    this.selectedPriority = event;
    this.applyFilters();
  }

  applyFilters(changeView: boolean = true) {
    this.ganttItems = this.originalGanttItems.filter(
      (task: { title: string; taskStatusId: number; taskPriorityId: number }) =>
        (this.selectedStatus == this.defaultStatus ||
          this.selectedStatus == task.taskStatusId) &&
        (this.selectedPriority == this.defaultPriority ||
          this.selectedPriority == task.taskPriorityId) &&
        task.title.toLowerCase().includes(this.searchedTerm)
    );

    if (this.ganttItems.length != 0 && changeView) {
      this.ganttComponent.scrollToDate(this.ganttItems[0].start);
    }
  }

  linkClick(event: GanttLineClickEvent<unknown>) {
    if (event.source && event.target) {
      const projectPermissions: Set<number> =
        this.permissionService.getProjectPermissions(this.projectId);

      if (!projectPermissions.has(ProjectPermission.REMOVE_TASK_DEPENDENCY)) {
        this.snackBar.open(
          'You dont have permission to remove task dependency!',
          'Close',
          { duration: 1500 }
        );

        return;
      }

      const taskId = Number(event.source.id) - this.currentBuffer;
      const dTaskId = Number(event.target.id) - this.currentBuffer;

      this.taskService.removeTaskDependency(taskId, dTaskId).subscribe({
        next: (data) => {
          const taskToRemoveDependencyFrom = this.tasks.find(
            (task: Task) => task.taskId === taskId
          );
          if (taskToRemoveDependencyFrom) {
            const indexToRemove =
              taskToRemoveDependencyFrom.dependentTasks.findIndex(
                (task: any) => task.taskId === dTaskId
              );

            if (indexToRemove !== -1) {
              taskToRemoveDependencyFrom.dependentTasks.splice(
                indexToRemove,
                1
              );
            }
          }

          this.mapTasksToGanttItems(false);
          this.snackBar.open('Successfully removed dependency!', 'Close', {
            duration: 1500,
          });
        },
        error: (error) => {
          this.snackBar.open('Failed removing dependency', 'Close', {
            duration: 1500,
          });
        },
      });
    }
  }

  protected readonly ProjectPermission = ProjectPermission;
}
