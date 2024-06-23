import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MemberService } from '../../services/member.service';
import { MatIconModule } from '@angular/material/icon';
import { Member } from '../../models/member';
import { MemberOverviewComponent } from '../member-overview/member-overview.component';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {environment} from "../../../environments/environment";
import {MatButton} from "@angular/material/button";
import {AuthService} from "../../services/auth.service";
import {GlobalPermission} from "../../enums/global-permissions.enum";
import {HasGlobalPermissionPipe} from "../../pipes/has-global-permission.pipe";

@Component({
  selector: 'app-member-info',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, NgOptimizedImage, MemberOverviewComponent, RouterLink, RouterLinkActive, MatButton, HasGlobalPermissionPipe],
  templateUrl: './member-info.component.html',
  styleUrl: './member-info.component.scss'
})
export class MemberInfoComponent {
  member: Member;
  authMemberId: number | null = this.authService.getAuthenticatedMembersId();

  constructor(public dialogRef: MatDialogRef<MemberInfoComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
                private router: Router, public dialogRef2: MatDialogRef<MemberInfoComponent>,
                  private route: ActivatedRoute, private authService: AuthService){
    this.member = data.member;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }


    protected readonly environment = environment;
  protected readonly GlobalPermission = GlobalPermission;
    protected readonly Date = Date;
}
