import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router} from "@angular/router";
import {MemberService} from "../services/member.service";
import {catchError, map, Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MemberGuard implements CanActivate {
  constructor(
    private memberService: MemberService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const memberId = Number(route.paramMap.get('id'));

    return this.memberService.checkIfExists(memberId).pipe(
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
