import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { Task } from '../models/task';
import { taskActivity } from '../models/taskActivity';
import { taskPriority } from '../models/taskPriority';
import { environment } from '../../environments/environment';
import { TaskStatus } from '../models/task-status';
import { taskComment } from '../models/taskComment';
import { ProjectFile } from '../models/project-file';

const TASK_API = `${environment.apiUrl}/Task`;
const PROJECT_API = `${environment.apiUrl}/Project`;
const TASKACTIVITY_API = `${environment.apiUrl}/TaskActivity`;
const TASKPRIOROTY_API = `${environment.apiUrl}/TaskPriority`;
const TASKCATEGORY_API = `${environment.apiUrl}/TaskCategory`;
const TASKCOMMENTS_API = `${environment.apiUrl}/TaskComment`;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${TASK_API}/project/${projectId}`);
  }

  getTaskStatusesByProject(projectId: number): Observable<TaskStatus[]> {
    return this.http.get<TaskStatus[]>(
      `${PROJECT_API}/${projectId}/TaskStatus`
    );
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${TASK_API}/${id}`);
  }

  saveTask(taskData: any): Observable<any> {
    return this.http.post<any>(`${TASK_API}`, taskData);
  }

  getAllTaskCategories(): Observable<any[]> {
    return this.http.get<any[]>(TASKCATEGORY_API);
  }

  updateTaskStatus(taskId: number, statusId: number): Observable<any> {
    return this.http.put<any>(
      `${TASK_API}/${taskId}/status/${statusId}`,
      httpOptions
    );
  }

  addTaskStatus(projectId: number, taskStatusName: string): Observable<any> {
    const addTaskStatusRequest = { name: taskStatusName };
    return this.http.post<any>(
      `${PROJECT_API}/${projectId}/TaskStatus`,
      addTaskStatusRequest
    );
  }

  getProjectMembers(projectId: number): Observable<any> {
    return this.http.get<any>(`${PROJECT_API}/${projectId}/members`);
  }

  getTasksByMember(memberId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${TASK_API}/members/${memberId}/tasks`);
  }

  getTaskActivitiesById(taskId: number): Observable<taskActivity[]> {
    return this.http.get<taskActivity[]>(`${TASKACTIVITY_API}/Task/${taskId}`);
  }

  getTaskPriority(taskId: number): Observable<taskPriority> {
    return this.http.get<taskPriority>(`${TASKPRIOROTY_API}/${taskId}`);
  }

  saveTaskActivity(taskAct: any): Observable<any> {
    return this.http.post<any>(`${TASKACTIVITY_API}`, taskAct);
  }

  getTaskActivityName(taskActivityId: number): Observable<any> {
    return this.http.get<any>(`${TASKACTIVITY_API}Type/${taskActivityId}`);
  }

  getTaskActivityType(): Observable<any> {
    return this.http.get<any>(`${TASKACTIVITY_API}Type`);
  }

  changeTaskDescription(task: any, taskId: number): Observable<any> {
    return this.http.put<any>(`${TASK_API}/${taskId}`, task);
  }

  deleteTaskActivity(taskActivityId: number): Observable<any> {
    return this.http.delete(`${TASKACTIVITY_API}/${taskActivityId}`);
  }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${TASK_API}/${taskId}`);
  }

  assignMembersToTask(taskId: number, membersId: number[]): Observable<any[]> {
    return this.http.put<any[]>(`${TASK_API}/${taskId}/assign`, membersId);
  }

  removeMembersFromTask(taskId: number, membersId: number): Observable<any[]> {
    return this.http.delete<any[]>(`${TASK_API}/${taskId}/remove/${membersId}`);
  }

  getTasksDependentOnTaskId(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${TASK_API}/${taskId}/DependentTasks`);
  }

  getTaskCategories(projectId: number) {
    return this.http.get(`${TASKCATEGORY_API}/${projectId}/TaskCategories`);
  }

  getTaskCategoriesOnProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${TASKCATEGORY_API}/${projectId}/TaskCategories`
    );
  }

  getDependantTasks(taskId: number) {
    return this.http.get(`${TASK_API}/${taskId}/DependentTasks`);
  }

  changeTaskDates(taskId: number, startDate: Date, deadline: Date) {
    startDate.setHours(startDate.getHours() + 2);
    deadline.setHours(deadline.getHours() + 2);
    return this.http.put(`${TASK_API}/${taskId}/ChangeDates`, {
      startDate,
      deadline,
    });
  }

  addTaskDependency(taskId: number, dTaskId: number) {
    return this.http.post(`${TASK_API}/${taskId}/dependency/${dTaskId}`, null);
  }

  removeTaskDependency(taskId: number, dTaskId: number) {
    return this.http.delete(`${TASK_API}/${taskId}/dependency/${dTaskId}`);
  }

  getTaskPriorities() {
    return this.http.get<taskPriority[]>(TASKPRIOROTY_API);
  }

  getTaskComments(): Observable<any[]> {
    return this.http.get<any[]>(`${TASKCOMMENTS_API}`);
  }

  getTaskCommentsByTaskId(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${TASKCOMMENTS_API}/${taskId}`);
  }

  saveTaskComment(taskComment: any): Observable<any[]> {
    return this.http.post<any[]>(`${TASKCOMMENTS_API}`, taskComment);
  }

  changeTaskNameDescriptionDeadline(
    taskId: number,
    taskData: any
  ): Observable<any[]> {
    return this.http.put<any[]>(`${TASK_API}/${taskId}`, taskData);
  }

  changeTaskPriority(taskId: number, priorityId: any) {
    return this.http.put<any[]>(
      `${TASK_API}/${taskId}/priority/${priorityId}`,
      null
    );
  }

  assignNewTaskLeader(taskId: number, memberId: number): Observable<any[]> {
    return this.http.post<any[]>(
      `${TASK_API}/${taskId}/AssignTaskLeader/${memberId}`,
      null
    );
  }

  getTaskFiles(taskId: any): Observable<ProjectFile[]> {
    return this.http.get<ProjectFile[]>(`${TASK_API}/${taskId}/Files`);
  }

  deleteTaskFile(taskId: number, fileId: number) {
    return this.http.delete(`${TASK_API}/${taskId}/files/${fileId}`);
  }

  uploadFiles(taskId: number, files: FormData) {
    return this.http.post(`${TASK_API}/${taskId}/files`, files);
  }

  updateTaskInfo(taskId: number, taskInfo: any) {
    return this.http.put<any[]>(`${TASK_API}/update/${taskId}`, taskInfo);
  }

  addTaskCategory(projectId: number, taskCategoryName: any) {
    return this.http.post<any[]>(
      `${TASKCATEGORY_API}/${projectId}/TaskCategory`,
      taskCategoryName
    );
  }

  changeTaskCategoy(taskId: number, categoryId: number) {
    return this.http.post<any[]>(
      `${TASK_API}/${taskId}/category/${categoryId}`,
      null
    );
  }

  deleteTaskCategory(projectId: number, taskCategoryId: number) {
    return this.http.delete<any[]>(
      `${TASKCATEGORY_API}/${projectId}/TaskCategory/${taskCategoryId}`
    );
  }
}
