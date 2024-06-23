import {Pipe, PipeTransform} from "@angular/core";
import {PermissionService} from "../services/permission.service";

@Pipe({
  standalone: true,
  name: 'isAssignedToProject',
  pure: false
})
export class IsAssignedToProject implements PipeTransform {
  constructor(private permissionService: PermissionService) {

  }

  transform(projectId: number): boolean {
    return this.permissionService.getProjectIds(projectId).has(projectId);
  }
}
