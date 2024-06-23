import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, Observable, of, skipWhile, throwError} from "rxjs";
import {EventEmitter, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {Member} from "../models/member";
import {tap} from "rxjs/internal/operators/tap";
import {ForgotPasswordForm} from "../forms/forgot-password.form";
import {ForgotPasswordCompleteForm} from "../forms/forgot-password-complete.form";
import { environment } from "../../environments/environment";
import {SignalRService} from "./signal-r.service";
import {PermissionService} from "./permission.service";

const AUTH_API = `${environment.apiUrl}/Auth`;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export const logoutSuccess = new EventEmitter<void>();

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authenticatedMemberSubject: BehaviorSubject<any>;
  private authenticatedMemberAvatarSubject: BehaviorSubject<any>;

  constructor(private http: HttpClient, private router: Router, private permissionService: PermissionService) {
    const authenticatedMember = localStorage.getItem('authenticated-member');
    const avatarUrl = localStorage.getItem('authenticated-member-avatar');
    this.authenticatedMemberSubject = new BehaviorSubject<any>(authenticatedMember ? JSON.parse(authenticatedMember) : null);
    this.authenticatedMemberAvatarSubject = new BehaviorSubject<any>(avatarUrl ? avatarUrl : null);
  }

  login(email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.http.post(AUTH_API, { email, password }, httpOptions).subscribe({
        next: (data: any) => {
          const jwtToken = data.jwtToken;
          const jwtTokenExpirationDate = data.jwtTokenExpirationDate;
          const refreshToken = data.refreshToken;
          const member = data.member;

          localStorage.setItem('jwt-token', jwtToken);
          localStorage.setItem('jwt-token-expiration-date', jwtTokenExpirationDate);
          localStorage.setItem('refresh-token', refreshToken);
          localStorage.setItem('authenticated-member-id', member.id.toString());
          localStorage.setItem('authenticated-member', JSON.stringify(member));
          localStorage.setItem('authenticated-member-avatar', `${environment.apiUrl}/Member/${member.id}/Avatar`);

          this.authenticatedMemberSubject.next(member);
          this.authenticatedMemberAvatarSubject.next(localStorage.getItem('authenticated-member-avatar'));

          this.permissionService.refreshData();

          resolve();
        },
        error: error => {
          reject('Invalid email and password combination.');
        }
      });
    });
  }

  logout() {
    console.log('logging out');

    localStorage.removeItem('jwt-token');
    localStorage.removeItem('jwt-token-expiration-date');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('authenticated-member-id');
    localStorage.removeItem('authenticated-member');
    localStorage.removeItem('authenticated-member-avatar');

    logoutSuccess.emit();

    this.router.navigate(['/login']);
  }

  getAuthenticatedMember() {
    return this.authenticatedMemberSubject.asObservable();
  }

  getAuthenticatedMembersId() {
    const id: any = localStorage.getItem('authenticated-member-id');

    if (id) {
      return parseInt(id);
    }

    return null;
  }

  getAuthenticatedMembersAvatar() {
    return this.authenticatedMemberAvatarSubject.asObservable();
  }

  updateAuthenticatedMembersAvatar() {
    const id: any = localStorage.getItem('authenticated-member-id');

    console.log('updated member avatar');

    if (id) {
      localStorage.setItem('authenticated-member-avatar', `${environment.apiUrl}/Member/${parseInt(id)}/Avatar?timestamp=${new Date().getTime()}`);
      this.authenticatedMemberAvatarSubject.next(localStorage.getItem('authenticated-member-avatar'));
    }
  }

  updateAuthenticatedMember(member: Partial<Member>) {
    const authMemberString = localStorage.getItem('authenticated-member');

    if (!authMemberString) {
      return;
    }

    const authMember = JSON.parse(authMemberString);

    console.log('updated member');

    if (authMember && authMember.id == member.id) {
      const updatedMember = {...authMember, ...member};

      localStorage.setItem('authenticated-member', JSON.stringify(updatedMember));
      this.authenticatedMemberSubject.next(updatedMember);
    }
  }

  getJwtToken(): string | null{
    return localStorage.getItem('jwt-token');
  }

  isJwtTokenExpired(): Date | null {
    const expiration = localStorage.getItem("expires_at");
    //const expiresAt = JSON.parse(expiration);
    return null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh-token');
  }

  isAuthenticated(): boolean {
    return this.getJwtToken() !== null && this.getAuthenticatedMembersId() !== null;
  }

  refreshJwtToken() {
    const refreshToken = {
      refreshToken: this.getRefreshToken()
    };

   return this.http.post<any>(`${AUTH_API}/Refresh`, refreshToken);
  }

  forgotPasswordRequest(forgotPasswordForm: ForgotPasswordForm) {
    return this.http.post<any>(`${AUTH_API}/ForgotPassword`, forgotPasswordForm);
  }

  completeForgotPasswordRequest(forgotPasswordCompleteForm: ForgotPasswordCompleteForm) {
    return this.http.post<any>(`${AUTH_API}/ForgotPassword/Complete`, forgotPasswordCompleteForm);
  }
}


