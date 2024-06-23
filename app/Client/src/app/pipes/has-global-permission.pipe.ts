import {Pipe, PipeTransform} from "@angular/core";
import {PermissionService} from "../services/permission.service";
import {GlobalPermission} from "../enums/global-permissions.enum";

@Pipe({
  standalone: true,
  name: 'hasGlobalPermission',
  pure: false
})
export class HasGlobalPermissionPipe implements PipeTransform {
  constructor(private permissionService: PermissionService) {

  }

  transform(globalPermission: GlobalPermission): boolean {
    return this.permissionService.getGlobalPermissions().has(globalPermission);
  }
}
