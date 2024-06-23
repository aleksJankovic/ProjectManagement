import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EditMemberComponent} from "../edit-member/edit-member.component";
import {ImageCropperModule} from "ngx-image-cropper";
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {MatCard, MatCardActions, MatCardContent} from "@angular/material/card";
import {MemberService} from "../../services/member.service";
import {NgToastService} from "ng-angular-popup";
import {AuthService} from "../../services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-add-avatar',
  standalone: true,
  imports: [
    ImageCropperModule,
    NgOptimizedImage,
    NgIf,
    MatButton,
    MatIcon,
    MatToolbar,
    MatCardContent,
    MatCard,
    MatCardActions
  ],
  templateUrl: './add-avatar.component.html',
  styleUrl: './add-avatar.component.scss'
})
export class AddAvatarComponent {
  selectedFile: any = '';
  croppedImage: any = '';
  memberId: any;

  constructor(public dialogRef: MatDialogRef<EditMemberComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private sanitizer: DomSanitizer,
              private memberService: MemberService, private snackBar: MatSnackBar,
              private authService: AuthService) {
    this.selectedFile = data.file;
    this.memberId = data.memberId;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
    console.log(this.croppedImage);
  }

  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  uploadAvatar() {
    this.memberService.setAvatar(this.memberId, this.croppedImage).subscribe({
      next: data => {
        this.snackBar.open('Successfully changed avatar.', 'Close', { duration: 3000 });


        this.authService.updateAuthenticatedMembersAvatar();

        this.closeDialog();
      },
      error: err => {
        this.snackBar.open('Failed uploading avatar.', 'Close', { duration: 3000 });
      }
    });
  }
}
