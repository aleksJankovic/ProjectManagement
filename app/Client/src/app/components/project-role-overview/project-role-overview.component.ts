import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatAnchor, MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatToolbar} from "@angular/material/toolbar";
import {NgForOf, NgIf} from "@angular/common";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Role} from "../../models/role";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {ProjectServiceGet} from "../../services/project.service";
import {Permission} from "../../models/permission";
import {UpdateRoleForm} from "../../forms/update-role.form";
import {AddRoleForm} from "../../forms/add-role.form";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-project-role-overview',
  standalone: true,
  imports: [
    MatAnchor,
    MatButton,
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
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './project-role-overview.component.html',
  styleUrl: './project-role-overview.component.scss'
})
export class ProjectRoleOverviewComponent implements OnInit, OnDestroy {
  roles: any[] = [];
  permissions: any[] = [];
  selectedRole: any;
  roleForm: any;
  projectId: any;
  members: any;
  private projectSubscription: any;

  constructor(public dialogRef: MatDialogRef<ProjectRoleOverviewComponent>, public projectService: ProjectServiceGet,
              private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef, private matDialog: MatDialog,
                @Inject(MAT_DIALOG_DATA) data: any) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    this.projectSubscription = this.projectService.getAllRoles(this.projectId).pipe(
      switchMap((roles : Role[]) => {
        this.roles = roles;

        this.roleForm = new FormGroup({
          name: new FormControl('', [
            Validators.required,
            this.uniqueRoleNameValidator(this.roles)
          ])
        });

        return this.projectService.getAllPermissions();
      })
    ).subscribe({
      next: (permissions : Permission[]) => {
        this.permissions = permissions;

        console.log(this.permissions);
        console.log(this.roles);
      },
      error: error => {
        this.snackBar.open('Error fetching data. Please try again.', 'Close', {
          duration: 3000, // Snackbar duration
          panelClass: ['snackbar-error'] // Optional custom styling
        });
      }
    })

  }

  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  uniqueRoleNameValidator(roles: any[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const nameExists = roles.some(role => role.name === control.value && role.id != this.selectedRole?.id);
      return nameExists ? {'nameExists': {value: control.value}} : null;
    };
  }

  addRole() {
    let newRoleName = `New Role 1`;
    let id = 1;

    // Check if a role with the same name already exists
    while (this.roles.some(role => role.name === newRoleName)) {
      id++;
      newRoleName = `New Role ${id}`;
    }

    const addRoleForm: AddRoleForm = {
      name: newRoleName
    }

    this.projectService.addRole(this.projectId, addRoleForm).subscribe({
      next: (data: any) => {
        this.roles = [...this.roles, data]; // Add the new role locally

        this.snackBar.open('Role added successfully!', 'Close', { duration: 3000 });
      },
      error: error => {
        this.snackBar.open('Failed to add role!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  trackByRole(index: number, role: Role): number {
    return role.id; // Assuming each role has a unique ID
  }

  selectRole(role: Role) {
    this.selectedRole = role;
    this.members = [];

    this.projectService.getMemberRoles(this.projectId, this.selectedRole.id).subscribe({
      next: data => {
        this.members = data;
      },
      error: error =>{
        console.log('failed fetching data');
      }
    });

    this.roleForm.patchValue({
      name: this.selectedRole.name,
    });

    if (this.selectedRole.isDefault) {
      this.roleForm.get('name').disable();
    } else {
      this.roleForm.get('name').enable();
    }

    this.roleForm.markAsPristine();
  }

  isPermissionAssigned(roleId: number, permissionId: number): boolean {
    const role = this.roles.find(r => r.id === roleId);

    // If role is found, check if permissionId exists in its permissionList
    if (role && role.permissionList) {
      return role.permissionList.some((permission: { permissionId: number; }) => permission.permissionId === permissionId);
    }

    return false;
  }

  togglePermission(checked: boolean, roleId: number, permissionId: number): void {
    if (checked) {
      this.addPermission(roleId, permissionId);
    } else {
      this.removePermission(roleId, permissionId);
    }
  }

  addPermission(roleId: number, permissionId: number) {
    console.log(roleId, permissionId);
    this.projectService.addPermissionToRole(this.projectId, roleId, permissionId).subscribe({
      next: data => {
        const role = this.roles.find(r => r.id === roleId);
        if (role && !this.isPermissionAssigned(roleId, permissionId)) {
          role.permissionList.push({ permissionId, permissionName: 'New Permission' });
        }

        this.snackBar.open(`Successfully added permission!`, 'Close', { duration: 1500 });
      },
      error: error => {
        this.snackBar.open(`Failed adding permission`, 'Close', { duration: 1500 });
      }
    });
  }

  removePermission(roleId: number, permissionId: number) {
    this.projectService.removePermissionFromRole(this.projectId, roleId, permissionId).subscribe({
      next: data => {
        // Remove the permission from the role's permissionList locally
        const role = this.roles.find(r => r.id === roleId);
        if (role) {
          const index = role.permissionList.findIndex((p: { permissionId: number; }) => p.permissionId === permissionId);
          if (index !== -1) {
            role.permissionList.splice(index, 1);
          }
        }

        this.snackBar.open(`Successfully removed permission!`, 'Close', { duration: 1500 });
      },
      error: error => {
        this.snackBar.open('Failed removing permission', 'Close', { duration: 1500 });
      }
    });
  }

  deleteRole(roleId: number): void {
    const roleToDelete = this.roles.find(role => role.id === roleId);

    if (!roleToDelete) {
      this.snackBar.open('Role not found!', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirm Deletion',
        message1: `Are you sure you want to delete ${roleToDelete.name}?`,
        message2: `All of it's members will be assigned to the default role!`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteRole(this.projectId, roleId).subscribe({
          next: () => {
            // Remove role from local array
            this.roles = this.roles.filter(role => role.id !== roleId);

            // Remove role from selected role if it matches
            if (this.selectedRole && this.selectedRole.id === roleId) {
              this.selectedRole = null;
            }

            // Refresh change detection
            this.cdRef.detectChanges();

            this.snackBar.open('Role deleted successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete role!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }

  saveGeneral() {
    if (this.roleForm.valid) {
      this.roleForm.patchValue({
        name: this.roleForm.get('name').value.trim()
      });

      const data: UpdateRoleForm = this.roleForm.value;
      const selectedRole = this.selectedRole;

      this.projectService.updateRole(this.projectId, this.selectedRole.id, data).subscribe({
        next: data => {
          const index = this.roles.findIndex(role => role.id === selectedRole.id);

          if (index !== -1) {
            this.roles[index] = data;
          }

          // Trigger view update
          this.cdRef.detectChanges();
          this.roleForm.markAsPristine();

          this.snackBar.open('Successfully changed settings!', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        },
        error: error => {
          this.snackBar.open('Error updating role.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.snackBar.open('Please fill out all required fields', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  protected readonly environment = environment;
    protected readonly Date = Date;
}
