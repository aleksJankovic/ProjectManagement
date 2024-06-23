import {Component, Input} from '@angular/core';
import {SignalRService} from "../../services/signal-r.service";
import {environment} from "../../../environments/environment";
import {NgIf, NgOptimizedImage, NgStyle} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {Member} from "../../models/member";
import {MemberInfoComponent} from "../member-info/member-info.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf,
    MatButton,
    MatIcon,
    NgStyle
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input() width: number = 32;
  @Input() height: number = 32;
  @Input() member: Member | null = null;
  @Input() status: boolean = false;

  constructor(private dialog: MatDialog) {
  }

  openMemberInfoDialog(member: Member): void {
    const dialogRef = this.dialog.open(MemberInfoComponent, {
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog zatvoren');
    });
  }

  protected readonly environment = environment;
    protected readonly Date = Date;
}
