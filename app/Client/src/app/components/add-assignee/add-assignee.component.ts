import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectServiceGet} from "../../services/project.service";
import {TaskService} from "../../services/task.service";
import {CommonModule} from "@angular/common";
import {Member} from "../../models/member";
import {MemberService} from "../../services/member.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-add-assignee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './add-assignee.component.html',
  styleUrl: './add-assignee.component.scss'
})
export class AddAssigneeComponent implements OnInit{
  constructor(public dialogRef: MatDialogRef<AddAssigneeComponent>,
              @Inject(MAT_DIALOG_DATA) public projectId: number,
              private pService : ProjectServiceGet,
              private tService : TaskService,
              private mService : MemberService) { }


  allMembers : Member[] = [];
  membersOnProject : Member[] = [];
  membersNotProject : Member[] = [];
  selectedMember: string = "-1";


  closeDialog(): void
  {
    this.dialogRef.close();
  }

  isMembersOnProject(member : Member): boolean
  {
    for(let i = 0; i < this.membersOnProject.length; i++)
    {
      if(this.membersOnProject[i].id === member.id)
        return true
    }
    return false;
  }

  fetchMembersNotOnProject()
  {
    this.mService.getMembers().subscribe((members : Member[]) =>{
      this.allMembers = members;

      this.pService.getProjectMembers(this.projectId).subscribe((members : Member[]) => {
        this.membersOnProject = members;

        for(let i=0;i<this.allMembers.length;i++)
        {
          if(!this.isMembersOnProject(this.allMembers[i]))
          {
            this.membersNotProject.push(this.allMembers[i])
          }
        }


      })
    })
  }

  ngOnInit(): void
  {
    this.selectedMember = "-1"
    this.fetchMembersNotOnProject();

  }

  addMember()
  {
    console.log(this.selectedMember);
    const membersId = [this.selectedMember];
    this.pService.assignMemberToProject(membersId, this.projectId).subscribe({
      next : data =>{
        console.log("Succesfully");
        this.selectedMember = "-1";
        this.fetchMembersNotOnProject();
      },
      error : error =>{
        console.log(error)
      }
    })
  }
}
