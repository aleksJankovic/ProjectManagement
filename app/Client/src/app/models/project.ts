import { Member } from "./member";
import {Task} from "./task";

export interface Project {
  projectId: number;
  projectName: string;
  projectDescription: string;
  deadline: Date;
  startDate: Date;
  dateFinished: Date;
  projectStatusId: number;
  status: string;
  projectTasks: Task[];
  teamLider: Member;
  numberOfPeople: number;
  numberOfTasks: number;
  projectPriorityId: number;
  projectPriority: string;
}
