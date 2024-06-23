import { Member } from './member';

export interface Task {
  taskId: number;
  taskName: string;
  taskDescription: string;
  startDate: Date;
  deadline: Date;
  dateFinished: Date;
  projectId: number;
  taskStatus: string;
  taskStatusId: number;
  taskPriorityId: number;
  isTaskDependentOn: boolean;
  taskCategoryId: number;
  taskCategoryName: string;
  assignedMembers: Member[];
  taskPriorityName: string;
  dependentTasks?: any;
  projectName?: string;
  taskLeaderId: number;
  taskLeaderFirstName: string;
  taskLeaderLastName: string;
  percentageComplete: number;
}
