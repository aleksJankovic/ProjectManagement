import {ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router} from "@angular/router";
import {catchError, map, Observable, of} from "rxjs";
import {MemberService} from "../services/member.service";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MemberEditGuard implements CanActivate {
  constructor(
    private memberService: MemberService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const memberId = Number(route.paramMap.get('id'));

    return this.memberService.hasEditAccess(memberId).pipe(
      map(isValid => {
        if (isValid) {
          return true;
        } else {
          this.router.navigate(['/members', 'all']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/members', 'all']);
        return of(false);
      })
    );
  }
}
