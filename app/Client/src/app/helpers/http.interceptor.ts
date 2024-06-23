import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError, finalize, throwError, Observable, Subject } from 'rxjs';
import { EventEmitter, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProgressBarService } from '../services/progress-bar.service';

let isRefreshing = false;
const refreshTokenSubject = new Subject<string | null>();
export const jwtRefreshSuccess = new EventEmitter<void>();

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const progressBarService = inject(ProgressBarService);

  const jwtToken = authService.getJwtToken();
  const clonedRequest = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${jwtToken}`)
  });

  progressBarService.show();

  return next(clonedRequest).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('Refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshJwtToken().pipe(
            switchMap(data => {
              const newJwtToken = data.jwtToken;
              const newJwtTokenExpirationDate = data.jwtTokenExpirationDate;
              const newRefreshToken = data.refreshToken;
              const member = data.member;

              localStorage.setItem('jwt-token', newJwtToken);
              localStorage.setItem('jwt-token-expiration-date', newJwtTokenExpirationDate);
              localStorage.setItem('refresh-token', newRefreshToken);
              localStorage.setItem('authenticated-member-id', member.id.toString());
              localStorage.setItem('authenticated-member', JSON.stringify(member));
              localStorage.setItem('authenticated-member-avatar', `${environment.apiUrl}/Member/${member.id}/Avatar`);

              authService.updateAuthenticatedMember(member);
              authService.updateAuthenticatedMembersAvatar();

              isRefreshing = false;
              refreshTokenSubject.next(newJwtToken);
              jwtRefreshSuccess.emit();

              const newRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newJwtToken}`
                }
              });

              return next(newRequest);
            }),
            catchError((refreshError) => {
              authService.logout();
              isRefreshing = false;
              return throwError(() => refreshError);
            }),
            finalize(() => {
              isRefreshing = false;
              progressBarService.hide();
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            switchMap(newJwtToken => {
              if (newJwtToken) {
                const newRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newJwtToken}`
                  }
                });
                return next(newRequest);
              } else {
                return throwError(() => err);
              }
            }),
            catchError((retryError) => {
              return throwError(() => retryError);
            }),
            finalize(() => {
              progressBarService.hide();
            })
          );
        }
      } else {
        return throwError(() => err);
      }
    }),
    finalize(() => {
      progressBarService.hide();
    })
  );
};
