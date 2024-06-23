import {Pipe, PipeTransform} from "@angular/core";
import {PermissionService} from "../services/permission.service";

@Pipe({
  standalone: true,
  name: 'isAssignedToTask',
  pure: false
})
export class IsAssignedToTask implements PipeTransform {
  constructor(private permissionService: PermissionService) {

  }

  transform(projectId: number, taskId: number): boolean {
    return this.permissionService.getProjectTaskIds(projectId).has(taskId);
  }
}
