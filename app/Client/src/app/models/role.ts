import {RoleMember} from "./role-member";
import {Permission} from "./permission";

export interface Role {
  id: number;
  name: string;
  isDefault: boolean;
  isFallback: boolean;
  permissions: Permission[];
  members: RoleMember[];
}
