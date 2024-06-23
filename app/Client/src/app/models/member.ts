import { Task } from "./task";

export interface Member {
  checked?: any;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  linkedin: string;
  github: string;
  status: string;
  isDisabled: boolean;
  phoneNumber: string;
  country: string;
  city: string;
  dateOfBirth: Date;
  dateAdded: Date;
  roleName: string;
  numberOfTasks?: number;
  projectRoleName?: string;
  projectRoleId?: number;
}
