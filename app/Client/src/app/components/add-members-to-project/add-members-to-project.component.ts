import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {NgToastModule, NgToastService} from "ng-angular-popup";
import {NgxEditorModule} from "ngx-editor";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TaskService} from "../../services/task.service";
import {MemberService} from "../../services/member.service";
import {ProjectServiceGet} from "../../services/project.service";
import {Member} from "../../models/member";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {environment} from "../../../environments/environment";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from "@angular/material/table";
import {AvatarComponent} from "../avatar/avatar.component";
import {MatMenu, MatMenuItem} from "@angular/material/menu";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort, MatSortHeader, Sort} from "@angular/material/sort";
import {SignalRService} from "../../services/signal-r.service";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {Role} from "../../models/role";
import {MatDivider} from "@angular/material/divider";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HasProjectPermissionPipe} from "../../pipes/has-project-permission.pipe";
import {ProjectPermission} from "../../enums/project-permissions.enum";

@Component({
  selector: 'app-add-members-to-project',
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    NgToastModule,
    NgxEditorModule,
    ReactiveFormsModule,
    MatCheckbox,
    MatProgressSpinner,
    MatToolbar,
    MatIcon,
    MatButton,
    MatTable,
    AvatarComponent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatMenu,
    MatMenuItem,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSortHeader,
    MatHeaderCellDef,
    MatSort,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    FormsModule,
    MatDivider,
    HasProjectPermissionPipe
  ],
  templateUrl: './add-members-to-project.component.html',
  styleUrl: './add-members-to-project.component.scss'
})
export class AddMembersToProjectComponent implements OnInit{

  membersOnThisProject : Member[] = [];
  allMembers : Member[] = [];
  teamLider : any;
  waiting: boolean = false;
  onlineAssignees: Set<number> = new Set<number>();
  dataSource: any;


  projectRoles: Role[] = [];

  displayedColumns = ['assigned', 'avatar', 'name', 'projectRole', 'email'];

  @ViewChild(MatSort)sort: any;
  @ViewChild(MatPaginator) paginator: any;

  constructor(public dialogRef: MatDialogRef<AddMembersToProjectComponent>,
              @Inject(MAT_DIALOG_DATA) public projectId: number,
              private tService : TaskService,
              private mService : MemberService,
              private snackBar: MatSnackBar,
              private pService: ProjectServiceGet,
              private signalRService: SignalRService,
              private _liveAnnouncer: LiveAnnouncer) { }


  ngOnInit(): void
  {
    this.fetchMembersOnProject();

    this.signalRService.getConnectedMemberIds().subscribe({
      next: data => {
        this.onlineAssignees = data;
      },
      error: err => {
        console.log('failed fetching online members')
      }
    });

    this.pService.getAllProjectRoles(this.projectId).subscribe({
      next: data => {
        this.projectRoles = data;
      },
      error: err => {
        console.log('failed fetching project roles');
      }
    });
  }

  fetchMembersOnProject()
  {
    this.pService.getMembersByProjectId(this.projectId).subscribe((members1 : Member[]) =>{
      this.membersOnThisProject = members1;
    })

    this.pService.getProjectById(this.projectId).subscribe((data : any)=>{
      this.teamLider = data.teamLider;
      this.mService.getMembers().subscribe((members2 : Member[]) =>{
        this.allMembers = members2;
        this.dataSource = new MatTableDataSource(this.allMembers);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    })

  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  isMemberOnProject(mId : number): any
  {
    for(let i=0;i<this.membersOnThisProject.length;i++)
    {
      if(mId === this.membersOnThisProject[i].id)
        return this.membersOnThisProject[i];
    }
    return null;
  }

  isMemberTeamLeader(mId : number) : boolean
  {
    if(mId === this.teamLider.id)
      return true;
    return false
  }


  assignRemove(event : any, memberId: number)
  {
    console.log(event)
    const membersList = [memberId];


    if(event) // assign
    {
      this.waiting = true;
      this.pService.assignMemberToProject(membersList, this.projectId).subscribe({
        next : data =>{
          this.snackBar.open('Successfully assigned member to project!', 'Close', { duration: 3000 });
          this.fetchMembersOnProject()
          this.waiting = false;
        },
        error : error =>{
          this.snackBar.open('Failed assigning member to project!', 'Close', { duration: 3000 });
          this.waiting = false;
        }
      })
    }
    else //remove
    {
      this.waiting = true;
      this.pService.removeMemberFromProject(memberId, this.projectId).subscribe({
        next : data =>{
          this.snackBar.open('Successfully unassigned member from project!', 'Close', { duration: 3000 });
          this.fetchMembersOnProject()
          this.waiting = false;
        },
        error : error =>{
          this.snackBar.open('Failed unassigning member from project!', 'Close', { duration: 3000 });
          this.waiting = false;
        }
      })
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  search(event: any): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  onRoleChange(memberId: number, $event: any) {
    this.pService.changeAssigneeRole(this.projectId, memberId, $event).subscribe({
      next: data => {
        this.snackBar.open('Successfully updating role!', 'Close', { duration: 3000 });
      },
      error: err => {
        this.snackBar.open('Error updating role!', 'Close', { duration: 3000 });

      }
    })
  }

  protected readonly environment = environment;
  protected readonly ProjectPermission = ProjectPermission;
}
