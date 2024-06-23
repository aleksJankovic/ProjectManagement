import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    RouterLink,
    MatButton,
    MatCardActions,
    MatCardContent,
    MatCardTitle,
    MatCardHeader,
    MatCard
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

}
