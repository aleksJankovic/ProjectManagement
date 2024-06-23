import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import {ProjectServiceGet} from "../services/project.service";
import {PermissionService} from "../services/permission.service";
import {catchError, map, Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProjectGuard implements CanActivate {
  constructor(
    private projectService: ProjectServiceGet,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const projectId = Number(route.paramMap.get('id'));
    const memberId = Number(localStorage.getItem('authenticated-member-id'));

    return this.projectService.hasAccessToProject(memberId, projectId).pipe(
      map(isValid => {
        if (isValid) {
          return true;
        } else {
          this.router.navigate(['/projects', 'all']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/projects', 'all']);
        return of(false);
      })
    );
  }
}
