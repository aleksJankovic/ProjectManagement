import {Pipe, PipeTransform} from "@angular/core";
import {PermissionService} from "../services/permission.service";
import {GlobalPermission} from "../enums/global-permissions.enum";
import {ProjectPermission} from "../enums/project-permissions.enum";

@Pipe({
  standalone: true,
  name: 'hasProjectPermission',
  pure: false
})
export class HasProjectPermissionPipe implements PipeTransform {
  constructor(private permissionService: PermissionService) {

  }

  transform(projectId: number, projectPermission: ProjectPermission): boolean {
    return this.permissionService.getProjectPermissions(projectId).has(projectPermission);
  }
}
