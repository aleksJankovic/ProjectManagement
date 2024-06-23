import { Component, OnInit } from '@angular/core';
import { NgIf, NgOptimizedImage } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Member } from '../../models/member';
import { Router } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { ForgotPasswordForm } from '../../forms/forgot-password.form';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf,
    FormsModule,
    NgToastModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  errorMessage: string | undefined;
  email: string | undefined;
  password: string | undefined;
  showForgotPasswordForm: boolean = false;

  //dodato za FormControl
  emailFormControl: FormControl;
  passwordFormControl: FormControl;
  loginForm: FormGroup;
  //

  forgotForm: any;

  constructor(
    private authService: AuthService,
    private memberService: MemberService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.emailFormControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.passwordFormControl = new FormControl('', [Validators.required]);

    this.loginForm = new FormGroup({
      email: this.emailFormControl,
      password: this.passwordFormControl,
    });
  }

  ngOnInit() {
    this.forgotForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = '* Email and password are required.';
      return;
    }

    this.authService
      .login(this.email!, this.password!)
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((err) => {
        this.errorMessage = err;
      });
  }

  toggleForgotPasswordForm() {
    this.showForgotPasswordForm = !this.showForgotPasswordForm;
  }

  forgotPasswordSubmit() {
    if (this.forgotForm.valid) {
      const data: ForgotPasswordForm = this.forgotForm.value;

      this.authService.forgotPasswordRequest(data).subscribe({
        next: (data) => {
          this.snackBar.open('Successfully sent request.', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Error sending request.', 'Close', { duration: 3000 });
        },
      });
    } else {
      this.snackBar.open('Form is not valid.', 'Close', { duration: 3000 });
    }
  }
}
