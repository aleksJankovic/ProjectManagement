import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {AddMemberForm} from "../forms/add-member.form";
import {BehaviorSubject, catchError, map, Observable, of, throwError} from "rxjs";
import {EditProfileForm} from "../forms/edit-profile.form";
import { Member } from "../models/member";
import { Role } from "../models/role";
import { environment} from "../../environments/environment";
import {Notification} from "../models/notification";
import {Dictionary} from "@worktile/gantt/utils/helpers";

const API = `${environment.apiUrl}/Member`;
const API_ROLES = `${environment.apiUrl}/Role`;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private memberSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) { }

  addMember(memberData: any): Observable<any> {
    return this.http.post<any>(`${API}`, memberData);
  }

  deleteMember(memberId: number) {
    return this.http.delete(`${API}/${memberId}`);
  }

  getMember(memberId: number): Observable<any>{
    return this.http.get<any>(`${API}/${memberId}`);
  }

  setMemberSubject(member: Member) {
    this.memberSubject.next(member);
  }

  getMemberSubject() {
    return this.memberSubject.asObservable();
  }

  updateMemberSubject(member: Partial<Member>) {
    const updatedMember = {...this.memberSubject.value, ...member};

    this.memberSubject.next(updatedMember);
  }

  getMembers(): Observable<any[]>{
    return this.http.get<any[]>(`${API}`);
  }

  getMemberById(id : number): Observable<Member>{
    return this.http.get<Member>(`${API}/${id}`);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${API_ROLES}`);
  }

  editMemberProfile(memberId: number, editProfileForm: EditProfileForm): Observable<any> {
    return this.http.put<any>(`${API}/${memberId}`, editProfileForm);
  }

  setAvatar(memberId: number, file: any) {
    const formData: FormData = new FormData();
    formData.append('fileDetails', file, file.name); // 'FileDetails' should match the property name on the server


    return this.http.post(`${API}/${memberId}/Avatar`, formData);
  }

  deleteAvatar(memberId: number) {
    return this.http.delete(`${API}/${memberId}/Avatar`);
  }

  getRoleById(id:number): Observable<Role> {
    return this.http.get<Role>(`${API_ROLES}/${id}`);
  }

  changeEmail(memberId: number, formData: any) {
    return this.http.post(`${API}/${memberId}/ChangeEmail`, formData);
  }

  changeRole(memberId: number, formData: { roleId: number }): Observable<Role> {
    return this.http.put<Role>(`${API}/${memberId}/ChangeRole`, formData);
  }

  changePassword(memberId: number, formData: { oldPassword: string, newPassword: string}) {
    return this.http.post(`${API}/${memberId}/ChangePassword`, formData);
  }

  resetPassword(memberId: number) {
    return this.http.post(`${API}/${memberId}/ForcePasswordReset`, null);
  }

  getNotifications(memberId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${API}/${memberId}/Notifications`);
  }

  readNotifications(memberId: number, notificationIds: number[]) {
    return this.http.put(`${API}/${memberId}/Notifications`, { notificationIds });
  }

  deleteNotifications(memberId: number, notificationIds: number[]) {
    return this.http.post(`${API}/${memberId}/Notifications`, { notificationIds });
  }

  hasEditAccess(memberId: number): Observable<boolean> {
    return this.http.get<boolean>(`${API}/${memberId}/HasEditAccess`);
  }

  checkIfExists(memberId: number): Observable<boolean> {
    return this.http.get<boolean>(`${API}/${memberId}/CheckIfExists`);
  }

  getGlobalPermissions(memberId: number): Observable<number[]> {
    return this.http.get<number[]>(`${API}/${memberId}/GetGlobalPermissions`);
  }

  getProjectPermissions(memberId: number): Observable<Map<number, number[]>> {
    return this.http.get<Map<number, number[]>>(`${API}/${memberId}/GetProjectPermissions`);
  }

  getProjectTasks(memberId: number): Observable<Map<number, number[]>> {
    return this.http.get<Map<number, number[]>>(`${API}/${memberId}/GetProjectTasks`);
  }
}
