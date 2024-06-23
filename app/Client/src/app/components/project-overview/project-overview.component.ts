import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MemberService } from "../../services/member.service";
import { TaskService } from "../../services/task.service";
import { ProjectServiceGet } from "../../services/project.service";
import { AddMembersToProjectComponent } from "../add-members-to-project/add-members-to-project.component";
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MemberInfoComponent } from '../member-info/member-info.component';
import { Member } from '../../models/member';
import { Task } from '../../models/task';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatButtonModule } from '@angular/material/button';
import { AddTaskComponent } from '../add-task/add-task.component';
import {environment} from "../../../environments/environment";
import { ConfirmationProjectComponent } from '../confirmation-project/confirmation-project.component';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { ProjectPriority } from '../../models/project-priority';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatNativeDateModule, MatOption, MatOptionModule } from '@angular/material/core';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ProjectStatus } from '../../models/project-status';
import { Project } from '../../models/project';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ProjectPermission} from "../../enums/project-permissions.enum";
import {HasProjectPermissionPipe} from "../../pipes/has-project-permission.pipe";
import {GlobalPermission} from "../../enums/global-permissions.enum";
import {MatToolbar} from "@angular/material/toolbar";
import {ProjectFilesComponent} from "../project-files/project-files.component";

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatCardModule, NgxChartsModule, MatButtonModule, MatInput, MatDatepickerModule,
    MatDatepickerInput, MatDatepickerToggle, MatNativeDateModule, MatLabel, MatFormFieldModule, FormsModule, MatSelectModule, MatOptionModule, NgToastModule, HasProjectPermissionPipe, MatToolbar, ProjectFilesComponent],
  templateUrl: './project-overview.component.html',
  styleUrls: ['./project-overview.component.scss']
})
export class ProjectOverviewComponent implements OnInit {
  @Input() project!: Project;
  @Output() projectUpdated = new EventEmitter<Project>()

  routeSub: any;
  projectId: number = 0;
  projectDetails: any;
  teamLeaderInfo: any;
  members : Member[] = [];
  numberOfMembers: number = 0;
  tasks: Task[] = [];
  numberOfTasks: number = 0;
  taskStatusData: any[] = [];
  recentActivities: any[] = [];
  today = new Date();
  projectPriorities: ProjectPriority[] = [];
  selectedPriority: number | null = null;
  projectStatuses: ProjectStatus[] = [];
  selectedStatus: number | null = null;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private mService: MemberService,
    private tService: TaskService,
    private pService: ProjectServiceGet,
    private matSnackBar: MatSnackBar,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.projectId = params['id'];
      this.loadProjectPriorities();
      this.loadProjectStatuses();
      this.getProjectDetails();
      this.refreshProjectData();
    });
  }

  refreshProjectData() {
    this.fetchMembersOnProject();
    this.loadTasksByProject(this.projectId);
    this.getTeamLeaderInfo(this.projectId);
    this.fetchTaskStatusData();
    this.loadRecentActivity(this.projectId);
  }


  loadRecentActivity(projectId: number): void {
    this.pService.getRecentActivity(projectId).subscribe((data: any[]) => {
      this.recentActivities = data.slice(0, 5);
    });
  }

  loadProjectPriorities(): void {
    this.pService.getProjectPriorities().subscribe(
      (priorities: ProjectPriority[]) => {
        this.projectPriorities = priorities;
        console.log('Project Priorities:', this.projectPriorities);
      },
      (error) => {
        console.error('Error fetching project priorities:', error);
      }
    );
  }

  loadProjectStatuses(): void {
    this.pService.getAllProjectStatuses().subscribe(
      (statuses: ProjectStatus[]) => {
        this.projectStatuses = statuses;
        console.log('Project Statuses:', this.projectStatuses);
      },
      (error) => {
        console.error('Error fetching project statuses:', error);
      }
    );
  }

  setDefaultPriority() {
    if (this.projectDetails && this.projectPriorities.length > 0) {
      this.selectedPriority = this.projectDetails.priorityId;
    }
  }

  calculateDaysRemaining(projectEndDate: Date): number {
    const currentDate = new Date();
    const endDate = new Date(projectEndDate);
    const timeDifference = endDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  }

  getDaysRemainingClass(daysRemaining: number): string {
    if (daysRemaining <= 0) {
      return 'overdue';
    } else if (daysRemaining <= 3) {
      return 'critical';
    }
    return '';
  }

  fetchMembersOnProject()
  {
    this.pService.getProjectMembers(this.projectId).subscribe((data : Member[])=>{
      this.members = data;
      this.numberOfMembers = this.members.length;
      //console.log(data);
    })
  }

  loadTasksByProject(projectId: number): void {
    this.tService.getTasksByProject(projectId).subscribe((data: Task[])=>{
      this.tasks = data;
      this.numberOfTasks = this.tasks.length;
      //console.log(this.members);
    })

  }

  getTeamLeaderInfo(projectId: number): void {
    this.pService.getProjectById(projectId)
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

  addMembersToProject() {
    this.openDialog();
  }

  addTasksToProject(){
    this.openTaskDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddMembersToProjectComponent, {
      width: '800px',
      height: '600px',
      data: this.projectId
    });

    dialogRef.afterClosed().subscribe(result => {

        this.refreshProjectData();

    });
  }

  openTaskDialog(): void {
    const dialogRef = this.dialog.open(AddTaskComponent, {
      width: '500px',
      data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {

        this.refreshProjectData();

    });
  }

  getProjectDetails() {
    forkJoin({
      projectDetails: this.pService.getProjectById(this.projectId),
      projectPriorities: this.pService.getProjectPriorities()
    }).subscribe(({ projectDetails, projectPriorities }) => {
      this.projectDetails = projectDetails;
      this.projectPriorities = projectPriorities;
      this.selectedPriority = this.projectDetails.projectPriorityId;
      this.selectedStatus = this.projectDetails.projectStatusId;
      //console.log('Project Details:', this.projectDetails);
      //console.log('Project Priorities:', this.projectPriorities);
      //console.log('Selected Priority:', this.selectedPriority);
    }, error => {
      console.error('Error loading project data:', error);
    });
  }

  fetchTaskStatusData() {
    this.tService.getTasksByProject(this.projectId).subscribe((tasks: Task[]) => {
      const statusCounts = this.countTasksByStatus(tasks);
      this.taskStatusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count
      }));
    });
  }

  countTasksByStatus(tasks: Task[]): { [status: string]: number } {
    const statusCounts: { [status: string]: number } = {};
    tasks.forEach(task => {
      if (statusCounts[task.taskStatus]) {
        statusCounts[task.taskStatus]++;
      } else {
        statusCounts[task.taskStatus] = 1;
      }
    });
    return statusCounts;
  }

  saveProjectDetails() {
    const updatedProject: Project = {
      ...this.projectDetails,
      projectPriorityId: this.selectedPriority,
      projectStatusId: this.selectedStatus
    };

    this.pService.updateProject(this.projectDetails.projectId, updatedProject).subscribe(
      response => {
        this.projectDetails = response;
        this.project = response;
        this.projectUpdated.emit(response);
        this.snackBar.open('Successfully changed project info!', 'Close', { duration: 3000 });
      },
      error => {
        console.error('Error updating project:', error);
      }
    );
  }


  openMemberInfoDialog(member: Member): void {
    const dialogRef = this.dialog.open(MemberInfoComponent, {
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog zatvoren');
    });
  }


  openProjectDeleteDialog(projectId: number): void {
    const dialogRef = this.dialog.open(ConfirmationProjectComponent, {
      data: { projectId: this.projectId}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog zatvoren');
    });
  }
  protected readonly environment = environment;
  protected readonly ProjectPermission = ProjectPermission;
  protected readonly GlobalPermission = GlobalPermission;
}
