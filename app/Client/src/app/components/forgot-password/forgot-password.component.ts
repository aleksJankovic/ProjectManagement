import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ForgotPasswordCompleteForm } from '../../forms/forgot-password-complete.form';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgOptimizedImage,
    NgToastModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  newPassword: string | undefined;
  confirmPassword: string | undefined;

  form: FormGroup;
  passwordMismatch: boolean = false;
  newPasswordFormControl!: FormControl;
  confirmPasswordFormControl!: FormControl;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.newPasswordFormControl = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.confirmPasswordFormControl = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.form = new FormGroup({
      passwordToken: new FormControl('', [Validators.required]),

      newPassword: this.newPasswordFormControl,
      confirmPassword: this.confirmPasswordFormControl,
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const refreshToken = params['token'];

      console.log(refreshToken);

      this.form.patchValue({ passwordToken: refreshToken });
    });
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.newPassword !== this.confirmPassword) {
        this.passwordMismatch = true;

        return;
      }

      this.passwordMismatch = false;

      const data: ForgotPasswordCompleteForm = this.form.value;

      this.authService.completeForgotPasswordRequest(data).subscribe({
        next: (data) => {
          // Handle success response
          this.snackBar.open('Password reset successfully.', 'Close', { duration: 3000 });


          // Optionally, you can reset the form after successful submission
          this.form.reset();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 4000);
        },
        error: (error) => {
          // Handle error response
          this.snackBar.open('Failed reseting password.', 'Close', { duration: 3000 });

        },
      });
    } else {
      this.snackBar.open('Input validation failed.', 'Close', { duration: 3000 });
    }
  }
}
