import { Component, AfterViewInit, ViewChild, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { Member } from '../../models/member';
import {RouterLink} from "@angular/router";
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Role } from '../../models/role';
import { AddMemberComponent } from '../add-member/add-member.component';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MemberInfoComponent } from '../member-info/member-info.component';
import {RoleOverviewComponent} from "../role-overview/role-overview.component";
import {environment} from "../../../environments/environment";
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {MatRadioModule} from '@angular/material/radio';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatDivider} from "@angular/material/divider";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatLabel, MatOption, MatSelect} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {AvatarComponent} from "../avatar/avatar.component";
import {SignalRService} from "../../services/signal-r.service";
import {GlobalPermission} from "../../enums/global-permissions.enum";
import {HasGlobalPermissionPipe} from "../../pipes/has-global-permission.pipe";
import {AuthService} from "../../services/auth.service";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {take} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-all-members',
  standalone: true,
  templateUrl: './all-members.component.html',
  styleUrl: './all-members.component.scss',
  imports: [CommonModule, RouterLink, FormsModule, NgToastModule, NgOptimizedImage, MatTableModule, MatPaginatorModule, MatSortModule, MatRadioModule, MatButton, MatDivider, MatFormField, MatInput, MatLabel, MatIcon, MatSelect, MatOption, MatMenu, MatMenuItem, MatMenuTrigger, AvatarComponent, HasGlobalPermissionPipe, MatIconButton],
  providers: [DatePipe]
})
export class AllMembersComponent implements OnInit, AfterViewInit{
  selectedRole: number = 0;
  defaultRole: number = 0;
  selectedStatus: number = 0;
  defaultStatus: number = 0;
  roles: Role[] = [];
  members : Member[] = [];
  filteredMembers: Member[] = [];
  onlineMembers: Set<number> = new Set<number>();
  displayedColumns: string[] = ['avatar',  'firstName', 'roleName', 'email', 'onlineStatus', 'date', 'actions'];
  dataSource: any;
  authMemberId: number | null = this.authService.getAuthenticatedMembersId();
  @ViewChild(MatSort)sort: any;
  @ViewChild(MatPaginator) paginator: any;

  constructor(private memberService: MemberService,  public dialog: MatDialog,
                 private _liveAnnouncer: LiveAnnouncer, private signalRService: SignalRService,
                  private authService: AuthService, private snackBar: MatSnackBar) {
    this.filteredMembers = this.members;
  }

  ngOnInit(){
    this.getMembersFromServer();
    this.getRolesFromServer();
    this.selectedRole = 0;

    this.signalRService.getConnectedMemberIds().subscribe({
      next: data => {
        this.onlineMembers = data;
      },
      error: err => {
        console.log('failed fetching online members');
      }
    })
  }

  ngAfterViewInit(): void {


  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  onRoleFilterChange(event: any) {
    this.selectedRole = event;
    this.applyFilters();
  }

  onStatusFilterChange(event: any) {
    this.selectedStatus = event;
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.data = this.members.filter(member =>
      (this.selectedRole == this.defaultRole || this.selectedRole == member.roleId) &&
      (this.selectedStatus == this.defaultStatus ||
          (this.selectedStatus == 1 && !this.onlineMembers.has(member.id)) ||
          (this.selectedStatus == 2 && this.onlineMembers.has(member.id)))
    );
  }

  getMembersFromServer(): void {
    this.memberService.getMembers().subscribe(
      (data: Member[]) => {
        this.members = data;
        this.filteredMembers = data;
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.log('Error fetching members:', error);
      }
    );
  }

  getRolesFromServer(): void {
    this.memberService.getRoles().subscribe(
      (data: Role[]) => {
        this.roles = data;
      },
      (error) => {
        console.log('Error fetching roles:', error);
      }
    );
  }

  search(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  openMemberDialog(): void{
    const dialogRef = this.dialog.open(AddMemberComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.memberAdded.subscribe(() => {
      this.getMembersFromServer();
    });
  }

  openRoleDialog() {
    const dialogRef = this.dialog.open(RoleOverviewComponent, {
      width: '800px',
      height: '600px'
    });
  }

    protected readonly environment = environment;
  protected readonly GlobalPermission = GlobalPermission;

  deactivateMember(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirm Deactivation',
        message1: `Are you sure you want to deactive this member?`,
        message2: `They won't be able to login again and you won't be able to activate them.`
      }
    });

    const dialogSub = dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.memberService.deleteMember(id).subscribe({
          next: data => {
            const index = this.members.findIndex(member => member.id === id);

            if (index !== -1) {
              this.members.slice(index);
            }

            this.snackBar.open("Deactivated member successfully", "Close", { duration: 3000 });
          },
          error: err => {
            this.snackBar.open("Failed deactivating member", "Close", { duration: 3000 });
          }
        });
      }
    });
  }
}
