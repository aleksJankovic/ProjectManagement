import { Component, OnInit } from '@angular/core';
import {NavigationEnd, NavigationStart, Router, RouterOutlet} from '@angular/router';
import { AllProjectsComponent } from './components/all-projects/all-projects.component';
import { AllMembersComponent } from './components/all-members/all-members.component';
import { AddProjectComponent } from './components/add-project/add-project.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {NgIf} from "@angular/common";
import { NgxEditorModule } from 'ngx-editor';
import {ProgressBarComponent} from "./components/progress-bar/progress-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    AllProjectsComponent,
    AllMembersComponent,
    AddProjectComponent,
    NavbarComponent,
    NgIf,
    NgxEditorModule,
    ProgressBarComponent
  ],
})
export class AppComponent {

}
