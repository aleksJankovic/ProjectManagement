import {Injectable} from "@angular/core";
import {HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from "@microsoft/signalr";
import {BehaviorSubject, Observable, skipWhile} from "rxjs";
import {environment} from "../../environments/environment";
import {Notification} from "../models/notification";
import {PermissionService} from "./permission.service";
import {jwtRefreshSuccess} from "../helpers/http.interceptor";
import {AuthService, logoutSuccess} from "./auth.service";
import {Member} from "../models/member";
import {MemberService} from "./member.service";

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: HubConnection;
  private connectedMembersSubject: BehaviorSubject<Set<number>>;
  private notificationSubject: BehaviorSubject<Notification | null> = new BehaviorSubject<Notification | null>(null);

  constructor(private permissionService: PermissionService, private authService: AuthService, private memberService: MemberService) {
    this.connectedMembersSubject = new BehaviorSubject<Set<number>>(new Set<number>());

    jwtRefreshSuccess.subscribe(() => {
      console.log('SIGNAL R: Detected jwt refresh, restarting connection!');

      this.stopConnection();
      this.createHub();
      this.startConnection();
    })

    logoutSuccess.subscribe(() => {
      console.log('SIGNAL R: Logged out, stopping connection!');
      this.stopConnection();
    })

    this.createHub();
    this.startConnection();
  }

  private registerServerEvents() {
    this.hubConnection.on('MemberConnected', (memberId: number) => {
      const connectedMembers = this.connectedMembersSubject.getValue();
      connectedMembers.add(memberId);
      this.connectedMembersSubject.next(connectedMembers);
    });

    this.hubConnection.on('MemberDisconnected', (memberId: number) => {
      const connectedMembers = this.connectedMembersSubject.getValue();
      connectedMembers.delete(memberId);
      this.connectedMembersSubject.next(connectedMembers);
    });

    this.hubConnection.on('ConnectedMembers', (memberIds: number[]) => {
      this.connectedMembersSubject.next(new Set(memberIds));
    });

    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      this.notificationSubject.next(notification);
    });

    this.hubConnection.on('AssignedToProject', (id: number) => {
      this.permissionService.addProjectId(id);
    });

    this.hubConnection.on('RemovedFromProject', (id: number) => {
      this.permissionService.removeProjectId(id);
    });

    this.hubConnection.on('UpdatedGlobalPermissions', (permissions: number[]) => {
      this.permissionService.updateGlobalPermissions(permissions);
    });

    this.hubConnection.on('UpdatedProjectPermissions', (projectId: number, permissions: number[]) => {
      this.permissionService.updateProjectPermissions(projectId, permissions);
    });

    this.hubConnection.on('UpdatedProjectTasks', (projectId: number, taskIds: number[]) => {
      this.permissionService.updateProjectTaskIds(projectId, taskIds);
    });

    this.hubConnection.on('UpdatedMemberDetails', (logout: boolean) => {
      if (logout) {
        this.authService.logout();
        return;
      }

      this.authService.updateAuthenticatedMembersAvatar();
      const id = Number(this.authService.getAuthenticatedMembersId());
      this.memberService.getMemberById(id).subscribe(member => {
        this.authService.updateAuthenticatedMember(member);
      })
    });
  }

  private createHub() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/SignalR`, {
        withCredentials: localStorage.getItem('jwt-token') != null,
        accessTokenFactory: () => {
          const token = localStorage.getItem('jwt-token');
          return token ? token : "";
        },
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Debug)  // Use Debug level for more detailed logging
      .build();

    this.registerServerEvents();
  }

  public startConnection() {
    // if (this.hubConnection.state !== HubConnectionState.Disconnected) {
    //   return;
    // }

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started'))
      .catch(err => console.log('Error while starting SignalR connection'));
  }

  public stopConnection() {
    this.hubConnection
      .stop()
      .then(() => console.log('SignalR connection stopped'))
      .catch(err => console.log('Error while stopping SignalR connection'));
  }

  // Method to get connected member IDs as an Observable
  public getConnectedMemberIds(): Observable<Set<number>> {
    return this.connectedMembersSubject.asObservable();
  }

  public getNotification(): Observable<Notification | null> {
    return this.notificationSubject.pipe(
      skipWhile(notification => notification === null)
    );
  }
}
