import {Component, OnInit} from '@angular/core';
import {NavbarComponent} from "../navbar/navbar.component";
import {RouterOutlet} from "@angular/router";
import {PermissionService} from "../../services/permission.service";
import {SignalRService} from "../../services/signal-r.service";
import {LlmChatComponent} from "../llm-chat/llm-chat.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterOutlet,
    LlmChatComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  constructor(private signalRService: SignalRService, private permisionService: PermissionService) {
    this.permisionService.refreshData();
  }

  ngOnInit(): void {
      this.signalRService.startConnection();
      this.permisionService.refreshData();
  }
}
