import {Component, input, OnDestroy, OnInit, Sanitizer} from '@angular/core';
import {MemberService} from "../../services/member.service";
import {Member} from "../../models/member";
import {ActivatedRoute, ParamMap, Params, RouterLink} from "@angular/router";
import {async, finalize, Observable, Subscription, switchMap, take} from "rxjs";
import {AsyncPipe, DatePipe, JsonPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {NgToastModule, NgToastService} from "ng-angular-popup";
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from "@angular/forms";
import {EditProfileForm} from "../../forms/edit-profile.form";
import {maxDateValidator} from "../../validators/max-date.validator";
import {AuthService} from "../../services/auth.service";
import {MatDialog} from "@angular/material/dialog";
import {AddAvatarComponent} from "../add-avatar/add-avatar.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatDivider} from "@angular/material/divider";
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatIcon} from "@angular/material/icon";
import {RoleService} from "../../services/role.service";
import {Role} from "../../models/role";
import {MatOption, MatSelect} from "@angular/material/select";
import {environment} from "../../../environments/environment";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {GlobalPermission} from "../../enums/global-permissions.enum";
import {HasGlobalPermissionPipe} from "../../pipes/has-global-permission.pipe";

@Component({
  selector: 'app-edit-member',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgToastModule,
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    NgIf,
    MatTabGroup,
    MatTab,
    MatCard,
    MatCardTitle,
    MatButton,
    MatCardContent,
    MatDivider,
    MatFormField,
    MatError,
    MatInput,
    MatLabel,
    MatHint,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatIcon,
    MatSelect,
    MatOption,
    NgForOf,
    AsyncPipe,
    JsonPipe,
    HasGlobalPermissionPipe
  ],
  templateUrl: './edit-member.component.html',
  styleUrl: './edit-member.component.scss'
})
export class EditMemberComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  selectedFile: any = null;
  member!: Observable<Member | null>;
  roles!: Observable<Role[]>;
  memberId!: number;

  private avatarLink: string = '';
  private timeStamp: number = new Date().getTime();
  private datePipe: DatePipe = new DatePipe('en-US'); // Create an instance of DatePipe
  private routeSubscription!: Subscription;


  memberForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]),
    linkedin: new FormControl(''),
    phoneNumber: new FormControl('', [
      Validators.pattern('^[0-9]{3}-[0-9]{3}-[0-9]{4}$')
    ]),
    country: new FormControl(''),
    city: new FormControl(''),
    github: new FormControl(''),
    status: new FormControl(''),
    dateOfBirth: new FormControl('', [
      maxDateValidator(this.todayDate())
    ])
  });

  emailForm: FormGroup = new FormGroup({
    oldEmail: new FormControl({ value: '', disabled: true }, [
      Validators.required,
      Validators.email,
    ]),
    newEmail: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  roleForm: FormGroup = new FormGroup({
    oldRoleId: new FormControl({value: '', disabled: true}, [Validators.required]),
    roleId: new FormControl('', [Validators.required])
  });

  passwordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', [
      Validators.required
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl(
      '',
      Validators.compose([Validators.required])
    )},
    this.passwordMatch('newPassword', 'confirmPassword')
  );

  constructor(private route: ActivatedRoute, private memberService: MemberService,
                private snackBar: MatSnackBar, private authService: AuthService,
                  private matDialog: MatDialog, private roleService: RoleService,
                    private matSnackBar: MatSnackBar) { }

  ngOnInit() {
    this.routeSubscription = this.route.params.pipe(
      switchMap(params => {
        this.memberId = params['id'];
        return this.memberService.getMember(this.memberId);
      })
    ).subscribe(member => {
      this.memberService.setMemberSubject(member)

      this.memberForm.patchValue({
        firstName: member.firstName,
        lastName: member.lastName,
        linkedin: member.linkedin,
        phoneNumber: member.phoneNumber,
        country: member.country,
        city: member.city,
        github: member.github,
        status: member.status,
        dateOfBirth: this.datePipe.transform(member.dateOfBirth, 'yyyy-MM-dd')
      });

      this.emailForm.patchValue({
        oldEmail: member.email
      });

      this.roleForm.patchValue({
        oldRoleId: member.roleId
      });

      this.setAvatarLink(`${environment.apiUrl}/Member/${member.id}/Avatar`);
    });

    this.roles = this.roleService.getAllRoles();
    this.member = this.memberService.getMemberSubject();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  getAvatarLink() {
    if (this.timeStamp) {
      return this.avatarLink + '?' + this.timeStamp;
    }

    return this.avatarLink;
  }

  setAvatarLink(url: string) {
    this.avatarLink = url;
    this.timeStamp = (new Date()).getTime();
  }

  todayDate(): string {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    const maxSize: number = 1024 * 1024; // 1MB

    if ( this.selectedFile &&  this.selectedFile.size > maxSize) {
      this.snackBar.open('File cant exceed 1MB.', 'Close', { duration: 3000 });


      event.target.value = '';

      return;
    }

    this.matDialog.open(AddAvatarComponent, {
      width: '420px',
      data: {
        memberId: this.memberId,
        file: this.selectedFile
      }
    }).afterClosed().subscribe(result => {
      this.setAvatarLink(`${environment.apiUrl}/Member/${this.memberId}/Avatar`);
    });

    event.target.value = '';
  }

  deleteAvatar() {
    console.log('runs');
    this.memberService.deleteAvatar(this.memberId).subscribe({
      next: data => {
        this.snackBar.open('Successfully deleted avatar.', 'Close', { duration: 3000 });


        this.authService.updateAuthenticatedMembersAvatar();
        this.setAvatarLink(`${environment.apiUrl}/Member/${this.memberId}/Avatar`);
      },
      error: err => {
        this.snackBar.open('Failed deleting avatar.', 'Close', { duration: 3000 });
      }
    });
  }

  saveChanges() {
    if (this.memberForm.valid) {
      const editProfileForm: EditProfileForm = this.memberForm.value;

      this.memberService.editMemberProfile(this.memberId, editProfileForm).subscribe({
        next: (data: any) => {
          this.memberService.updateMemberSubject(data);
          this.authService.updateAuthenticatedMember(data);

          this.snackBar.open('Successfully updated profile settings.', 'Close', { duration: 3000 });
        },
        error: error => {
          this.snackBar.open('Failed updating profile settings.', 'Close', { duration: 3000 });

        }
      });
    } else {
      this.snackBar.open('Input validation failed.', 'Close', { duration: 3000 });
    }
  }

  submitEmail() {
    if (!this.emailForm.valid) {
      this.snackBar.open('Input validation failed.', 'Close', { duration: 3000 });

      return;
    }

    if (this.emailForm.get('newEmail')?.value == this.emailForm.get('oldEmail')?.value) {
      this.snackBar.open('New email can not match old email.', 'Close', { duration: 3000 });

      return;
    }

    const formData = {
      newEmail: this.emailForm.get('newEmail')?.value
    };

    this.memberService.changeEmail(this.memberId, formData).subscribe({
      next: (data: any) => {
        this.snackBar.open('Email updated successfully.', 'Close', { duration: 3000 });

        this.emailForm.patchValue({
          oldEmail: formData.newEmail,
          newEmail: ''
        });

        this.emailForm.markAsPristine();
        this.emailForm.markAsUntouched();

        const updatedMember: Partial<Member> = {
          id: this.memberId,
          email: formData.newEmail
        };

        this.authService.updateAuthenticatedMember(updatedMember);
        this.memberService.updateMemberSubject(updatedMember);
      },
      error: error => {
        this.snackBar.open('Failed changing email.', 'Close', { duration: 3000 });

      }
    });
  }

  submitRole() {
    if (!this.roleForm.valid) {
      this.snackBar.open('Input validation failed.', 'Close', { duration: 3000 });

      return;
    }

    const formData = this.roleForm.value;

    this.memberService.changeRole(this.memberId, formData).subscribe({
      next: (data: Role) => {
        this.snackBar.open('Role changed successfully.', 'Close', { duration: 3000 });


        this.roleForm.patchValue({
          oldRoleId: formData.roleId,
          roleId: ''
        });

        this.roleForm.markAsPristine();
        this.roleForm.markAsUntouched();

        const updatedMember: Partial<Member> = {
          id: this.memberId,
          roleId: data.id,
          roleName: data.name
        };

        this.authService.updateAuthenticatedMember(updatedMember);
        this.memberService.updateMemberSubject(updatedMember);
      },
      error: error => {
        this.snackBar.open('Failed changing role.', 'Close', { duration: 3000 });
      }
    });
  }

  submitPassword() {
    if (!this.passwordForm.valid) {
      this.snackBar.open('Input validation failed.', 'Close', { duration: 3000 });

      return;
    }

    const formData = this.passwordForm.value;

    this.memberService.changePassword(this.memberId, formData).subscribe({
      next: data => {
        this.snackBar.open('Password changed successfully.', 'Close', { duration: 3000 });
        this.passwordForm.reset();
      },
      error: error => {
        this.snackBar.open('Failed changing passwords.', 'Close', { duration: 3000 });
      }
    });
  }

  passwordMatch(password: string, confirmPassword: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const passwordControl = formGroup.get(password);
      const confirmPasswordControl = formGroup.get(confirmPassword);

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      if (
        confirmPasswordControl.errors &&
        !confirmPasswordControl.errors['passwordMismatch']
      ) {
        return null;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirmPasswordControl.setErrors(null);
        return null;
      }
    };
  }

  submitPasswordReset() {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirm Reset',
        message1: `Are you sure you want to reset their password?`,
        message2: `They will be forced to login again`
      }
    });

    const dialogSub = dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
        if (result) {
          this.memberService.resetPassword(this.memberId).subscribe({
            next: data => {
              this.snackBar.open('Password reset successfully.', 'Close', { duration: 3000 });
            },
            error: error => {
              this.snackBar.open('Failed reseting password.', 'Close', { duration: 3000 });
            }
          });
        }
      }
    );
  }

    protected readonly GlobalPermission = GlobalPermission;
}
