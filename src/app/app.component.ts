import { Component, OnInit } from '@angular/core';

import { 
    faAngleDoubleLeft, faAngleDoubleRight,
    faCalendar, faEnvelope, faQuestion, faTasks, faUser   } from '@fortawesome/free-solid-svg-icons'
import { faDizzy  } from '@fortawesome/free-regular-svg-icons'

import { CanvasHelper, NgxSmartCanvasService, SmartCanvasInfo } from 'ngx-smart-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  faDizzy = faDizzy;
  faCalendar = faCalendar;
  faEnvelope = faEnvelope;
  faQuestion = faQuestion;
  faTasks = faTasks;
  faUser = faUser;
  faAngleDoubleLeft = faAngleDoubleLeft;
  faAngleDoubleRight = faAngleDoubleRight;

  showSideBar = true;

  constructor(private smartCanvasSvc: NgxSmartCanvasService) {}

  ngOnInit(): void {
    this.smartCanvasSvc.ready$.subscribe(x => {this.Draw(x)});
    this.smartCanvasSvc.redrawRequest$.subscribe(x => {this.Draw(x)});
  }

  Draw(x: SmartCanvasInfo) {
    
    x.ctx.fillStyle = 'grey';
    x.ctx.strokeStyle = 'black';

    CanvasHelper.roundRect(x.ctx, 100, 100, 100, 30, 5);
    x.ctx.fill();11

  }


  toggleSidebar() {
    this.showSideBar = !this.showSideBar
  }

}
