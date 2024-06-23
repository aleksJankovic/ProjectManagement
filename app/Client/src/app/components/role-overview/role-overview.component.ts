import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {RoleService} from "../../services/role.service";
import {Role} from "../../models/role";
import {KeyValue, KeyValuePipe, NgForOf, NgIf} from "@angular/common";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatOption} from "@angular/material/autocomplete";
import {MatError, MatFormField, MatLabel, MatSelect} from "@angular/material/select";
import {MatInput} from "@angular/material/input";
import {MatCheckbox} from "@angular/material/checkbox";
import {forkJoin, map} from "rxjs";
import {switchMap} from "rxjs/operators";
import {AddRoleForm} from "../../forms/add-role.form";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDivider} from "@angular/material/divider";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UpdateRoleForm} from "../../forms/update-role.form";
import {RoleMember} from "../../models/role-member";
import {Member} from "../../models/member";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-role-overview',
  standalone: true,
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatButton,
    NgForOf,
    NgIf,
    MatTabGroup,
    MatTab,
    MatCard,
    MatCardContent,
    MatOption,
    MatSelect,
    MatFormField,
    MatInput,
    MatLabel,
    MatCardHeader,
    MatCardTitle,
    MatCheckbox,
    MatDivider,
    MatError,
    ReactiveFormsModule,
    KeyValuePipe,
    MatAnchor
  ],
  templateUrl: './role-overview.component.html',
  styleUrl: './role-overview.component.scss'
})
export class RoleOverviewComponent implements OnInit {
  roles: any[] = [];
  permissions: any[] = [];
  rolePermissions: any[] = [];
  selectedRole: any;
  roleForm: any;

  constructor(public dialogRef: MatDialogRef<RoleOverviewComponent>, public roleService: RoleService,
                private snackBar: MatSnackBar, private cdRef: ChangeDetectorRef, private matDialog: MatDialog) { }

  ngOnInit() {
    const roles$ = this.roleService.getAllRoles();
    const permissions$ = this.roleService.getAllPermissions();

    forkJoin([roles$, permissions$]).pipe(
      switchMap(([roles, permissions]) => {
        this.roles = roles;
        this.permissions = permissions;

        this.roleForm = new FormGroup({
          name: new FormControl('', [
            Validators.required,
            this.uniqueRoleNameValidator(this.roles)
          ])
        });

        const rolePermissionRequests = roles.map(role => {
          // Fetch role with permissions
          const roleWithPermissions$ = this.roleService.getRoleWithPermissions(role.id).pipe(
            map((permissions) => ({ roleId: role.id, permissions }))
          );

          // Fetch all role members
          const roleMembers$ = this.roleService.getAllRoleMembers(role.id).pipe(
            map((members) => ({ roleId: role.id, members }))
          );

          // Combining both requests
          return forkJoin([roleWithPermissions$, roleMembers$]).pipe(
            map(([roleWithPermissions, roleMembers]) => ({
              ...roleWithPermissions,
              roleMembers
            }))
          );
        });

        return forkJoin(rolePermissionRequests);
      })
    ).subscribe(roleData => {
      this.rolePermissions = roleData;
      console.log(this.rolePermissions);
    });
  }

  uniqueRoleNameValidator(roles: any[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const nameExists = roles.some(role => role.name === control.value && role.id != this.selectedRole?.id);
      return nameExists ? {'nameExists': {value: control.value}} : null;
    };
  }

  isPermissionAssigned(roleId: number, permissionId: number): boolean {
    const rolePermission = this.rolePermissions.find(rp => rp.roleId === roleId);

    if (rolePermission) {
      return rolePermission.permissions.some((p: { permissionId: number; }) => {
        return p.permissionId === permissionId;
      });
    }

    return false;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  selectRole(role: Role) {
    this.selectedRole = role;

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

  trackByRole(index: number, role: Role): number {
    return role.id; // Assuming each role has a unique ID
  }

  saveGeneral() {
    if (this.roleForm.valid) {
      this.roleForm.patchValue({
        name: this.roleForm.get('name').value.trim()
      });

      const data: UpdateRoleForm = this.roleForm.value;
      const selectedRole = this.selectedRole;

      this.roleService.updateRole(this.selectedRole.id, data).subscribe({
        next: data => {
          const index = this.roles.findIndex(role => role.id === selectedRole.id);

          if (index !== -1) {
            this.roles[index] = data;
          }

          // Trigger view update
          this.cdRef.detectChanges();
          this.roleForm.markAsPristine();

          this.snackBar.open('Successfully changed settings!', 'Close', { duration: 3000 });
        },
        error: error => {
          this.snackBar.open('Error updating role.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill out all required fields', 'Close', { duration: 3000 });
    }
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

    this.roleService.addRole(addRoleForm).subscribe({
      next: (data: any) => {
        this.roles = [...this.roles, data]; // Add the new role locally

        // Create new role permissions and members structure
        const newRolePermission = {
          roleId: data.id,
          permissions: [
          ],
          roleMembers: {
            roleId: data.id,
            members: []
          }
        };

        this.rolePermissions = [...this.rolePermissions, newRolePermission];

        this.snackBar.open('Role added successfully!', 'Close', { duration: 3000 });
      },
      error: error => {
        this.snackBar.open('Failed to add role!', 'Close', { duration: 3000 });
      }
    });
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
    this.roleService.addPermissionToRole(roleId, permissionId).subscribe({
      next: data => {
        const rolePermissionIndex = this.rolePermissions.findIndex(rp => rp.roleId === roleId);
        if (rolePermissionIndex !== -1) {
          this.rolePermissions[rolePermissionIndex].permissions.push({ permissionId: permissionId });
        }

        this.snackBar.open(`Successfully added permission!`, 'Close', { duration: 1500 });
      },
      error: error => {
        this.snackBar.open(`Failed adding permission`, 'Close', { duration: 1500 });
      }
    });
  }

  removePermission(roleId: number, permissionId: number) {
    this.roleService.removePermissionFromRole(roleId, permissionId).subscribe({
      next: data => {
        const rolePermissionIndex = this.rolePermissions.findIndex(rp => rp.roleId === roleId);
        if (rolePermissionIndex !== -1) {
          const permissionIndex = this.rolePermissions[rolePermissionIndex].permissions.findIndex((p: { permissionId: number; }) => p.permissionId === permissionId);
          if (permissionIndex !== -1) {
            this.rolePermissions[rolePermissionIndex].permissions.splice(permissionIndex, 1);
          }
        }

          this.snackBar.open(`Successfully removed permission!`, 'Close', { duration: 1500 });
      },
      error: error => {
        this.snackBar.open('Failed removing permission', 'Close', { duration: 1500 });
      }
    });
  }

  getRoleMembers(roleId: number): Member[] {
    const rolePermission = this.rolePermissions.find(rp => rp.roleId === roleId);
    return rolePermission ? rolePermission.roleMembers.members : [];
  }


  deleteRole(roleId: number): void {
    const roleToDelete = this.roles.find(role => role.id === roleId);

    if (!roleToDelete) {
      this.snackBar.open('Role not found!', 'Close', { duration: 3000 });
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
        this.roleService.deleteRole(roleId).subscribe({
          next: () => {
            // Remove role from local array
            this.roles = this.roles.filter(role => role.id !== roleId);
            this.rolePermissions = this.rolePermissions.filter(rp => rp.roleId !== roleId);

            // Remove role from selected role if it matches
            if (this.selectedRole && this.selectedRole.id === roleId) {
              this.selectedRole = null;
            }

            // Refresh change detection
            this.cdRef.detectChanges();

            this.snackBar.open('Role deleted successfully!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete role!', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  protected readonly close = close;
    protected readonly environment = environment;
    protected readonly Date = Date;
}
