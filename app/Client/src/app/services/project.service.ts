import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Project } from '../models/project';
import { HttpHeaders } from '@angular/common/http';
import {Member} from "../models/member";
import {environment} from "../../environments/environment";
import {Role} from "../models/role";
import {Permission} from "../models/permission";
import {UpdateRoleForm} from "../forms/update-role.form";
import {AddRoleForm} from "../forms/add-role.form";
import {RoleMember} from "../models/role-member";
import {ProjectStatus} from "../models/project-status";
import {taskActivity} from "../models/taskActivity";
import {ProjectPriority} from "../models/project-priority";
import {ProjectFile} from "../models/project-file";
import {TaskStatus} from "../models/task-status";

const PROJECT_API = `${environment.apiUrl}/Project`;
const PROJECT_PRIORITY = `${environment.apiUrl}/ProjectPriority`

@Injectable({
  providedIn: 'root'
})
export class ProjectServiceGet{
  constructor(private http: HttpClient) { }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${PROJECT_API}`);
  }

  updateProject(projectId: number, projectInfo: Project): Observable<Project> {

    return this.http.put<Project>(`${PROJECT_API}/${projectId}`, projectInfo);
  }

  getRecentActivity(projectId: number): Observable<any[]>{
    return this.http.get<any[]>(`${PROJECT_API}/${projectId}/Latest`);
  }

  deleteProjectById(id? : number): Observable<any[]>
  {
    return this.http.delete<any>(`${PROJECT_API}/${id}`);
  }

  deleteTaskStatus(projectId? : number, statusId? : number): Observable<any[]>{
    return this.http.delete<any>(`${PROJECT_API}/${projectId}/TaskStatus/${statusId}`);
  }

  getProjectById(id : number): Observable<Project>
  {
    return this.http.get<Project>(`${PROJECT_API}/${id}`);
  }

  getMembersByProjectId(projectId: number): Observable<Member[]> {
    return this.http.get<Member[]>(`${PROJECT_API}/${projectId}/members`);
  }

  getProjectMembers(projectId: number): Observable<Member[]>
  {
    return this.http.get<Member[]>(`${PROJECT_API}/${projectId}/members`);
  }

  assignMemberToProject(membersId : any, projectId : number) : Observable<any>
  {
    return this.http.post<Member>(`${PROJECT_API}/${projectId}/members`, membersId);
  }

  removeMemberFromProject(memberId : number, projectId: number) : Observable<any>
  {
    return this.http.delete<Member>(`${PROJECT_API}/${projectId}/members/${memberId}`);
  }

  getTaskCategoriesOnProject(projectId : number) : Observable<any[]>
  {
    return this.http.get<any[]>(`${PROJECT_API}/project/${projectId}/categories`);
  }

  getAllRoles(projectId: number): Observable<Role[]> {
    return this.http.get<Role[]>(`${PROJECT_API}/${projectId}/Roles`);
  }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${PROJECT_API}/Permissions`);
  }

  updateRole(projectId: number, roleId: number, updateRoleForm: UpdateRoleForm) {
    return this.http.put<Role>(`${PROJECT_API}/${projectId}/Roles/${roleId}`, updateRoleForm);
  }

  addRole(projectId: number, addRoleForm: AddRoleForm) {
    return this.http.post<Role>(`${PROJECT_API}/${projectId}/Roles`, addRoleForm);
  }

  deleteRole(projectId: number, roleId: number) {
    return this.http.delete(`${PROJECT_API}/${projectId}/Roles/${roleId}`);
  }

  addPermissionToRole(projectId: number, roleId: number, permissionId: number) {
    return this.http.post(`${PROJECT_API}/${projectId}/Roles/${roleId}/Permissions/${permissionId}`, null);
  }

  removePermissionFromRole(projectId: number, roleId: number, permissionId: number) {
    return this.http.delete(`${PROJECT_API}/${projectId}/Roles/${roleId}/Permissions/${permissionId}`);
  }

  getMemberRoles(projectId: number, roleId: number) {
    return this.http.get<RoleMember[]>(`${PROJECT_API}/${projectId}/Roles/${roleId}/Members`);
  }

  getProjectPriorities(): Observable<ProjectPriority[]> {
    return this.http.get<ProjectPriority[]>(PROJECT_PRIORITY);
  }

  addProject(projectData: any) {
    return this.http.post(PROJECT_API, projectData);
  }

  getAllProjectsWhereMemberIsAssigned(memberId: number) {
    return this.http.get<Project[]>(`${PROJECT_API}/Member/${memberId}`);
  }

  getAllProjectStatuses() {
    return this.http.get<ProjectStatus[]>(`${PROJECT_API}/Status`);
  }

  getAllTaskStatusesOnProject(projectId : number) : Observable<TaskStatus[]>  {
    return this.http.get<TaskStatus[]>(`${PROJECT_API}/${projectId}/TaskStatus`);
  }

  getAllActivitiesInLastTwoWeeks(projectId: number) : Observable<any[]>
  {
    return this.http.get<any[]>(`${PROJECT_API}/${projectId}/taskActivities/activitiesCountByDateLastTwoWeeks`);
  }

  getAssignedProjectIds(memberId: number): Observable<number[]> {
    return this.http.get<number[]>(`${PROJECT_API}/Member/${memberId}/AssignedProjectIds`);
  }

  hasAccessToProject(memberId: number, projectId: number): Observable<boolean> {
    return this.http.get<boolean>(`${PROJECT_API}/${projectId}/Member/${memberId}/HasAccess`);
  }

  getAllProjectRoles(projectId: number): Observable<Role[]> {
    return this.http.get<Role[]>(`${PROJECT_API}/${projectId}/Roles`);
  }

  changeAssigneeRole(projectId: number, memberId: number, roleId: number) {
    return this.http.put(`${PROJECT_API}/${projectId}/Members/${memberId}/Roles/${roleId}`, {});
  }

  getProjectFiles(projectId: number): Observable<ProjectFile[]> {
    return this.http.get<ProjectFile[]>(`${PROJECT_API}/${projectId}/Files`);
  }

  deleteProjectFile(projectId: number, fileId: number) {
    return this.http.delete(`${PROJECT_API}/${projectId}/files/${fileId}`);
  }

  uploadFiles(projectId: number, files: FormData) {
    return this.http.post(`${PROJECT_API}/${projectId}/files`, files)
  }
}


