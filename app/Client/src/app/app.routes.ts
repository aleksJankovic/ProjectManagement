import {RouterConfigOptions, Routes} from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AllMembersComponent } from './components/all-members/all-members.component';
import { AllProjectsComponent } from './components/all-projects/all-projects.component';
import { MemberOverviewComponent } from './components/member-overview/member-overview.component';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {AuthGuard} from "./guards/auth.guard";
import {EditMemberComponent} from "./components/edit-member/edit-member.component";
import {ProjectComponent} from "./components/project/project.component";
import {AllAssigneesComponent} from "./components/all-assignees/all-assignees.component";
import {AllTasksComponent} from "./components/all-tasks/all-tasks.component";
import {ProjectKanbanComponent} from "./components/project-kanban/project-kanban.component";
import {ForgotPasswordComponent} from "./components/forgot-password/forgot-password.component";
import {ProjectOverviewComponent} from "./components/project-overview/project-overview.component";
import {ProjectGanttComponent} from "./components/project-gantt/project-gantt.component";
import {MainComponent} from "./components/main/main.component";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {ProjectAnalyticsComponent} from "./components/project-analytics/project-analytics.component";
import {ProjectGuard} from "./guards/project.guard";
import {MemberEditGuard} from "./guards/member-edit.guard";
import {MemberGuard} from "./guards/member.guard";

export const routerConfig: RouterConfigOptions = {
  paramsInheritanceStrategy: 'always'
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot/:token', component: ForgotPasswordComponent },
  { path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'members/all', component: AllMembersComponent, canActivate: [AuthGuard] },
      { path: 'members/:id/edit', component: EditMemberComponent, canActivate: [AuthGuard, MemberEditGuard] },
      { path: 'members/:id', component: MemberOverviewComponent, canActivate: [AuthGuard, MemberGuard] },
      { path: 'projects/all', component: AllProjectsComponent, canActivate: [AuthGuard] },
      {
        path: 'projects/:id',
        component: ProjectComponent,
        canActivate: [AuthGuard, ProjectGuard],
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', component: ProjectOverviewComponent, canActivate: [AuthGuard, ProjectGuard] },
          { path: 'gantt', component: ProjectGanttComponent, canActivate: [AuthGuard, ProjectGuard] },
          { path: 'kanban', component: ProjectKanbanComponent, canActivate: [AuthGuard, ProjectGuard] },
          { path: 'assignees', component: AllAssigneesComponent, canActivate: [AuthGuard, ProjectGuard] },
          { path: 'tasks', component: AllTasksComponent, canActivate: [AuthGuard, ProjectGuard] },
          { path: 'analytics', component: ProjectAnalyticsComponent, canActivate: [AuthGuard, ProjectGuard] },
        ]
      }
    ]
  },
  { path: '**', component: NotFoundComponent } // or to a 404 component
]
