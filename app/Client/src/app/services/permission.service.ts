import {EventEmitter, Injectable, OnInit} from "@angular/core";
import {ProjectServiceGet} from "./project.service";
import {HttpClient} from "@angular/common/http";
import {MemberService} from "./member.service";
import {ActivatedRoute, Router} from "@angular/router";

export const ganttUpdater: EventEmitter<void> = new EventEmitter();

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private projectIds: Set<number> = new Set<number>();
  private globalPermissions: Set<number> = new Set<number>();
  private projectPermissions: Map<number, Set<number>> = new Map<number, Set<number>>();
  private projectTaskIds: Map<number, Set<number>> = new Map<number, Set<number>>();

  constructor(
    private projectService: ProjectServiceGet,
    private memberService: MemberService,
  ) {
    this.refreshData();
  }

  refreshData() {
    const memberId = Number(localStorage.getItem('authenticated-member-id'));

    this.projectService.getAssignedProjectIds(memberId).subscribe({
      next: data=> {
        // console.log(`PERMISSION SERVICE: successfully fetched assigned projects ${data}`);
        this.projectIds = new Set<number>(data);
      },
      error: err => {
        console.log('PERMISSION SERVICE: failed fetching assigned projects');
      }
    });

    this.memberService.getGlobalPermissions(memberId).subscribe({
      next: data => {
        // console.log(`PERMISSION SERVICE: successfully fetched global permissions ${data}`);
        this.globalPermissions = new Set<number>(data);
      },
      error: err => {
        console.log('PERMISSION SERVICE: failed fetching global permissions');
      }
    });

    this.memberService.getProjectPermissions(memberId).subscribe({
      next: (data: Map<number, number[]>) => {
        const permissionsMap = new Map<number, Set<number>>();
        for (const [key, value] of Object.entries(data)) {
          const projectId = Number(key);
          if (!isNaN(projectId) && Array.isArray(value)) {
            permissionsMap.set(projectId, new Set<number>(value));
          } else {
            console.error(`Invalid entry for projectId ${key}:`, value);
          }
        }
        this.projectPermissions = permissionsMap;

        // console.log(`PEMRISSION SERVICE: successfully fetched project permissions`);
        // console.log(this.projectPermissions);
      },
      error: err => {
        console.log('PERMISSION SERVICE: failed fetching project permissions');
      }
    });

    this.memberService.getProjectTasks(memberId).subscribe({
      next: (data: Map<number, number[]>) => {
        const projectTaskIds = new Map<number, Set<number>>();
        for (const [key, value] of Object.entries(data)) {
          const projectId = Number(key);
          if (!isNaN(projectId) && Array.isArray(value)) {
            projectTaskIds.set(projectId, new Set<number>(value));
          } else {
            console.error(`Invalid entry for projectId ${key}:`, value);
          }
        }
        this.projectTaskIds = projectTaskIds;

        // console.log(`PEMRISSION SERVICE: successfully fetched assigned tasks`);
        // console.log(this.projectTaskIds);
      },
      error: err => {
        console.log('PERMISSION SERVICE: failed fetching assigned tasks');
      }
    });
  }

  getProjectIds(id: number): Set<number> {
    return this.projectIds;
  }

  removeProjectId(id: number): void {
    this.projectIds.delete(id);
  }

  addProjectId(id: number): void {
    this.projectIds.add(id);
  }

  getGlobalPermissions(): Set<number> {
    return this.globalPermissions;
  }

  getProjectPermissions(projectId: number): Set<number> {
    projectId = Number(projectId);

    if (!this.projectPermissions.has(projectId)) {
      return new Set<number>();
    }

    return this.projectPermissions.get(projectId)!; // Using non-null assertion operator (!)
  }

  updateGlobalPermissions(globalPermissions: number[]): void {
    // console.log(`updated global permissions to ${globalPermissions}`);
    this.globalPermissions = new Set<number>(globalPermissions);
  }

  updateProjectPermissions(projectId: number, permissions: number[]): void {
    // console.log(`updated project ${projectId} permissions to ${permissions}`);
    this.projectPermissions.set(projectId, new Set<number>(permissions));
    ganttUpdater.emit();
  }

  updateProjectTaskIds(projectId: number, taskIds: number[]): void {
    // console.log(`updated project ${projectId} assigned task ids to ${taskIds}`);
    this.projectTaskIds.set(projectId, new Set<number>(taskIds));
    ganttUpdater.emit();
  }

  getProjectTaskIds(projectId: number): Set<number> {
    projectId = Number(projectId);

    if (!this.projectTaskIds.has(projectId)) {
      return new Set<number>();
    }

    return this.projectTaskIds.get(projectId)!; // Using non-null assertion operator (!)
  }
}
