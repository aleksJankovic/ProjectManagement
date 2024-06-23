import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatProgressBar} from "@angular/material/progress-bar";
import {ProgressBarService} from "../../services/progress-bar.service";
import {NgIf} from "@angular/common";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [
    MatProgressBar,
    NgIf
  ],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  isHidden = true;
  private visibilitySubscription!: Subscription;

  constructor(private progressBarService: ProgressBarService) {}

  ngOnInit() {
    this.visibilitySubscription = this.progressBarService.visibilityChanges().subscribe(
      isHidden => {
        this.isHidden = isHidden;
      }
    );
  }

  ngOnDestroy() {
    if (this.visibilitySubscription) {
      this.visibilitySubscription.unsubscribe();
    }
  }
}
