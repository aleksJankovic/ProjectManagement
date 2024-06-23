import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import { MemberService } from '../../services/member.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AddTaskComponent } from '../add-task/add-task.component';
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatError, MatOption, MatSelect} from "@angular/material/select";
import {MatSnackBar} from "@angular/material/snack-bar";
@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgToastModule,
    MatButton,
    MatIcon,
    MatToolbar,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatSelect,
    MatOption,
    MatCardActions,
    ReactiveFormsModule,
    MatError
  ],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent implements OnInit {
  memberForm!: FormGroup;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  roleId: number | null = null;
  availableRoles: any[] = [];
  isLoading: boolean = false;

  @Output() memberAdded: EventEmitter<any> = new EventEmitter<any>();
disableSelect: any;

  constructor(public dialogRef: MatDialogRef<AddTaskComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private memberService: MemberService, private snackBar: MatSnackBar,
               private fb: FormBuilder){
  }

  ngOnInit() {
    this.memberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', Validators.required]
    });

    this.loadRoles();
  }

  loadRoles(){
    this.memberService.getRoles().subscribe((roles: any[]) =>{
      this.availableRoles = roles;
    }, error => {
      console.error('Error fetching roles', error);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  showMessage(){
    this.snackBar.open('Successfully added member.', 'Close', { duration: 3000 });

  }

  addMember(): void {
    if (this.memberForm.invalid) {
      this.snackBar.open('Please fill out all of the inputs.', 'Close', { duration: 3000 });

      return;
    }

    this.isLoading = true;

    const memberData = this.memberForm.value;

    this.memberService.addMember(memberData).subscribe({
      next: response => {
        console.log('Member saved successfully:', response);
        this.memberAdded.emit();
        this.showMessage();
        this.isLoading = false;
        this.closeDialog();
      },
      error: error => {
        this.isLoading = false;
        this.snackBar.open('Error with adding member.', 'Close', { duration: 3000 });
      }
    });
  }
}
