import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl, FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProjectAddRequest } from '../../models/project-add';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent} from "@angular/material/card";
import {MatError, MatFormField, MatHint, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatToolbar} from "@angular/material/toolbar";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {ProjectServiceGet} from "../../services/project.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LLMService} from "../../services/llm.service";
import {LLMResponse} from "../../models/llm-response";

@Component({
  selector: 'app-add-project',
  standalone: true,
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    NgToastModule,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatError,
    MatFormField,
    MatHint,
    MatIcon,
    MatInput,
    MatLabel,
    MatSelect,
    MatToolbar,
    ReactiveFormsModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatOption,
    MatDatepickerModule,
    MatSuffix,
    MatProgressSpinner
  ]
})
export class AddProjectComponent implements OnInit {
  @Output() projectAdded: EventEmitter<any> = new EventEmitter<any>();

  projectForm!: FormGroup;
  projectPriorities: any;

  isLoading: boolean = false;
  today: Date = new Date(); // Initialize today's date

  constructor(public dialogRef: MatDialogRef<AddProjectComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
                private projectService: ProjectServiceGet, private matSnackBar: MatSnackBar,
                  private fb: FormBuilder, private llmService: LLMService) { }

  ngOnInit() {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      projectDescription: ['', Validators.required],
      deadline: ['', Validators.required],
      priorityId: ['', Validators.required]
    });

    this.projectService.getProjectPriorities().subscribe({
      next: data => {
        this.projectPriorities = data;
      },
      error: error => {
        console.log('error fetching project priorities');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  showMessage() {
    this.matSnackBar.open('Project added succesfully.', 'Close', { duration: 3000 });

  }

  showMessageError() {
    this.matSnackBar.open('Failed adding project.', 'Close', { duration: 3000 });

  }

  addProject() {
    if (this.projectForm.valid) {
      this.isLoading = true;

      const projectData = this.projectForm.value;

      this.projectService.addProject(projectData).subscribe({
        next: (response: any) => {
          // Close the dialog
          this.closeDialog();

          // Emit an event to notify parent component
          this.projectAdded.emit(response);

          // Show success message
          this.showMessage();
          this.isLoading = false;
        },
        error: (error: any) => {
          // Show error message
          this.showMessageError();

          // Log the error
          console.log('Error adding project:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Mark all form controls as touched to display validation errors
      this.projectForm.markAllAsTouched();
    }
  }

  generateDescription() {
    if (this.projectForm.get('projectName')?.valid) {
      const projectName: string = this.projectForm.get('projectName')?.value;
      const question: string = `I want to create a project named ${projectName}. Can you help me make a short description.
      I just want you to write me the project description, no comments, or anything else.`;

      this.isLoading = true;
      this.llmService.generateText(question).subscribe({
        next: (data: LLMResponse) => {
          this.projectForm.get('projectDescription')?.setValue(data.response);
          this.matSnackBar.open('Successfully generated description', 'Close', { duration: 3000 });
          this.isLoading = false;
        },
        error: error => {
          this.matSnackBar.open('Failed to generate description using AI', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.matSnackBar.open('You must enter a title!', 'Close', { duration: 3000 });
    }
  }
}
