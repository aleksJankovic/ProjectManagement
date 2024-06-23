import {Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {Member} from "../../models/member";
import {MemberService} from "../../services/member.service";
import {MatToolbar} from "@angular/material/toolbar";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDivider} from "@angular/material/divider";
import {first, Observable, Subscription} from "rxjs";
import {ThemeService} from "../../services/theme.service";
import {Option} from "@angular/cli/src/command-builder/utilities/json-schema";
import {Theme} from "../../models/theme";
import theme from "tailwindcss/defaultTheme";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatBadge} from "@angular/material/badge";
import {SignalRService} from "../../services/signal-r.service";
import {Notification} from "../../models/notification";
import {List} from "postcss/lib/list";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {switchMap} from "rxjs/operators";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    NgIf,
    MatToolbar,
    MatButton,
    MatAnchor,
    NgForOf,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    AsyncPipe,
    MatRadioButton,
    MatRadioGroup,
    MatBadge,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatIconButton,
    DatePipe
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  member: Member | null | undefined;
  memberId!: number;
  avatarUrl: string | undefined;
  options$: Observable<Theme[]> = this.themeService.getThemeOptions();
  defaultTheme: any;
  notRead: number = 0;
  today: Date = new Date();
  notifications: Notification[] = [];

  buttons = [
    { link: '/dashboard', text: 'Dashboard', icon: 'home' },
    { link: '/projects/all', text: 'Projects', icon: 'insert_drive_file' },
    { link: '/members/all', text: 'Members', icon: 'person' },
  ];

  constructor(private authService: AuthService, private router: Router,
                private themeService: ThemeService, private signalRService: SignalRService,
                  private memberService: MemberService) { }

  ngOnInit() {

    this.authService.getAuthenticatedMember().pipe(
      switchMap(member => {
        this.member = member;
        this.memberId = member.id;
        return this.memberService.getNotifications(member.id); // Assuming your service has a method to fetch notifications
      })
      ).subscribe(notifications => {
        console.log('received notifications through login');

        this.notifications = notifications.map(n => {
          if (!n.isRead)
            this.notRead += 1;

          const utcDate = new Date(n.createdAt);
          const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset()*60*1000);

          return {
            id: n.id,
            title: n.title,
            description: n.description,
            createdAt: localDate,
            isRead: n.isRead
          }
        });
    });

    this.authService.getAuthenticatedMembersAvatar().subscribe(avatarUrl => {
      this.avatarUrl = avatarUrl;
    });

    this.signalRService.getNotification().subscribe({
      next: data => {
        if (data != null) {
          console.log('received notification through socket');

          if (!data.isRead)
            this.notRead += 1;

          const utcDate = new Date(data.createdAt);
          const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset()*60*1000);

          data.createdAt = new Date(localDate);
          this.notifications.unshift(data);
        }
      },
      error: err => {
        console.log('failed receiving notification through socket');
      }
    })

    this.defaultTheme = localStorage.getItem('selected-theme');

    if (!this.defaultTheme) {
      this.defaultTheme = 'indigo-pink';
    }

    this.themeService.setTheme(this.defaultTheme);
  }

  changeTheme(themeToSet: string) {
    this.themeService.setTheme(themeToSet);
    localStorage.setItem('selected-theme', themeToSet);
    this.defaultTheme = themeToSet;
  }

  logout() {
    this.authService.logout();
  }

  readNotifications() {
    this.notRead = 0;

    let notificationIds: number[] = this.notifications.map((n: Notification) => {
      return n.id
    });

    this.memberService.readNotifications(this.memberId, notificationIds).subscribe({
      next: data => {
        console.log('successfully read all notifications');

        this.notifications.forEach(n => n.isRead = true);
      },
      error: err => {
        console.log('failed reading all notifications');
      }
    });
  }

  clearNotifications() {
    let notificationIds: number[] = this.notifications.map((n: Notification) => {
      return n.id
    });

    this.memberService.deleteNotifications(this.memberId, notificationIds).subscribe({
      next: data => {
        console.log('successfully cleared all notifications');
        this.notifications = [];
      },
      error: err => {
        console.log('failed clearing all notifications');
      }
    })
  }

  clearNotification(id: number) {
    let notificationIds: number[] = [id];

    this.memberService.deleteNotifications(this.memberId, notificationIds).subscribe({
      next: data => {
        console.log(`successfully cleared notification with id ${id}`);

        const index = this.notifications.findIndex(notification => notification.id === id);
        // If found, remove it from the array using splice
        if (index !== -1)
          this.notifications.splice(index, 1);
      },
      error: err => {
        console.log('failed clearing all notifications');
      }
    })
  }
}
