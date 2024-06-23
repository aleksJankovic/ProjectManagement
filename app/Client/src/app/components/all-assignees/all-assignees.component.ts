import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {ActivatedRoute, Event, RouterLink} from "@angular/router";
import {Member} from "../../models/member";
import {ProjectServiceGet} from "../../services/project.service";
import {TaskService} from "../../services/task.service";
import {MemberService} from "../../services/member.service";
import {FormsModule} from "@angular/forms";
import {Task} from "../../models/task";
import {TaskOverviewComponent} from "../task-overview/task-overview.component";
import {AddAssigneeComponent} from "../add-assignee/add-assignee.component";
import {MatDialog} from "@angular/material/dialog";
import {RoleOverviewComponent} from "../role-overview/role-overview.component";
import {ProjectRoleOverviewComponent} from "../project-role-overview/project-role-overview.component";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { environment } from '../../../environments/environment';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AddMembersToProjectComponent } from '../add-members-to-project/add-members-to-project.component';
import {MatDivider} from "@angular/material/divider";
import {AvatarComponent} from "../avatar/avatar.component";
import {SignalRService} from "../../services/signal-r.service";
import {Role} from "../../models/role";
import {HasProjectPermissionPipe} from "../../pipes/has-project-permission.pipe";
import {ProjectPermission} from "../../enums/project-permissions.enum";

@Component({
  selector: 'app-all-assignees',
  standalone: true,
  imports: [
    NgOptimizedImage,
    DatePipe,
    MatButton,
    MatMenu,
    MatMenuItem,
    NgForOf,
    NgIf,
    MatMenuTrigger,
    RouterLink,
    FormsModule,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatRadioButton,
    MatTableModule,
    MatRadioGroup, MatPaginatorModule, MatSortModule, MatDivider, AvatarComponent, HasProjectPermissionPipe, MatIconButton
  ],
  templateUrl: './all-assignees.component.html',
  styleUrl: './all-assignees.component.scss'
})
export class AllAssigneesComponent implements OnInit{
  private routeSub: any;
  assignees : Member[] = [];
  filteredAssignees : Member[] = [];
  onlineAssignees: Set<number> = new Set<number>();
  projectId : number = 0;
  selectedProjectRole: number = 0;
  defaultProjectRole: number = 0;
  selectedStatus: number = 0;
  defaultStatus: number = 0;
  roles: Role[] = [];
  displayedColumns: string[] = ['avatar',  'firstName', 'projectRoleName', 'email', 'onlineStatus', 'date', 'action'];
  dataSource: any;
  projectRoles: Role[] = [];
  @ViewChild(MatSort)sort: any;
  @ViewChild(MatPaginator) paginator: any;

  constructor(private route: ActivatedRoute, private pService : ProjectServiceGet,
                private tService : TaskService, private mService : MemberService,
                  public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer,
                    private signalRService: SignalRService) { }



  ngOnInit(): void
  {
    this.routeSub = this.route.params.subscribe((params : any) => {
      this.projectId = params['id'];
      this.fetchMembersOnProject();
    })

    this.signalRService.getConnectedMemberIds().subscribe({
      next: data => {
        this.onlineAssignees = data;
      },
      error: err => {
        console.log('failed fetching online members')
      }
    });

    this.mService.getRoles().subscribe(
      (data: Role[]) => {
        this.roles = data;
      },
      (error) => {
        console.log('Error fetching roles:', error);
      }
    );

    this.pService.getAllProjectRoles(this.projectId).subscribe({
      next: data => {
        this.projectRoles = data;
      },
      error: err => {
        console.log('failed fetching project roles');
      }
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  fetchMembersOnProject()
  {
    this.pService.getProjectMembers(this.projectId).subscribe((data : Member[])=>{
      this.assignees = data;
      this.filteredAssignees = data;
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    })
  }

  clickMethod()
  {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddMembersToProjectComponent, {
      width: '800px',
      height: '600px',
      data: this.projectId
    });

    dialogRef.afterClosed().subscribe((result : any) => {
      console.log('The dialog was closed');
      this.fetchMembersOnProject()
    });
  }

  removeAssignee(assignee: Member)
  {
    this.pService.removeMemberFromProject(assignee.id, this.projectId).subscribe({
      next : data =>{
        console.log("Removed successfully.");
        this.fetchMembersOnProject()
      },
      error : error =>{
        console.log("Error removing");
        this.fetchMembersOnProject()
      }
    })
  }

  openRoleDialog() {
    const dialogRef = this.dialog.open(ProjectRoleOverviewComponent, {
      width: '800px',
      height: '600px',
      data: {
        projectId: this.projectId
      }
    });
  }

  search(event: any): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  onProjectRoleFilterChange(event: any) {
    this.selectedProjectRole = event;
    this.applyFilters();
  }

  onStatusFilterChange(event: any) {
    this.selectedStatus = event;
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.data = this.assignees.filter(member =>
      (this.selectedProjectRole == this.defaultProjectRole || this.selectedProjectRole == member.projectRoleId) &&
      (this.selectedStatus == this.defaultStatus ||
        (this.selectedStatus == 1 && !this.onlineAssignees.has(member.id)) ||
        (this.selectedStatus == 2 && this.onlineAssignees.has(member.id)))
    );
  }

  protected readonly environment = environment;
  protected readonly ProjectPermission = ProjectPermission;
}
