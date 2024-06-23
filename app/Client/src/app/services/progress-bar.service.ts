import { Injectable } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {
  private visibilitySubject = new BehaviorSubject<boolean>(true);

  visibilityChanges(): Observable<boolean> {
    return this.visibilitySubject.asObservable();
  }

  show() {
    this.updateVisibility(false);
  }

  hide() {
    this.updateVisibility(true);
  }

  private updateVisibility(isHidden: boolean) {
    this.visibilitySubject.next(isHidden);
  }
}
