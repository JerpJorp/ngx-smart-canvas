import { Component, OnInit } from '@angular/core';

import { 
    faAngleDoubleLeft, faAngleDoubleRight,
    faCalendar, faEnvelope, faQuestion, faTasks, faUser   } from '@fortawesome/free-solid-svg-icons'
import { faDizzy  } from '@fortawesome/free-regular-svg-icons'

import { CanvasHelper, NgxSmartCanvasService, SmartCanvasInfo } from 'ngx-smart-canvas';
import { filter } from 'rxjs/operators';

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

  rectangle = { x: 100, y: 100, width: 100, height: 40 };

  constructor(private smartCanvasSvc: NgxSmartCanvasService) {}

  ngOnInit(): void {
    this.smartCanvasSvc.ready$.pipe(filter(x => x !== undefined)).subscribe(x => { this.Draw(x)});
    this.smartCanvasSvc.redrawRequest$.subscribe(x => {this.Draw(x)});
    this.smartCanvasSvc.click$.subscribe(x => this.CanvasClick(x));
    this.smartCanvasSvc.mouseOver$.subscribe(x => this.CanvasMouseOver(x));
  }

  CanvasMouseOver(x: SmartCanvasInfo): void {    
    this.smartCanvasSvc.ready$.value?.ctx
    //use x.mouseToCanvas.canvasXY to see if one of your canvas objects was passed over by the mouse
  }

  CanvasClick(x: SmartCanvasInfo): void {

    //  raw mouse event x/y
    console.log(`Mouse X/y: ${x.mouseToCanvas?.mouseEvent.x}, ${x.mouseToCanvas?.mouseEvent.y}`);

    // where mouse is on canvas element
    console.log(`Canvas Element X/y: ${x.mouseToCanvas?.canvasMouseXy.x}, ${x.mouseToCanvas?.canvasMouseXy.y}`);

    // where x/y actually fall on original canvas drawing (adjusted for scale/skew/scroll)
    console.log(`Canvas Coordinates X/y: ${x.mouseToCanvas?.canvasXY.x}, ${x.mouseToCanvas?.canvasXY.y}`);

    //use x.mouseToCanvas.canvasXY to see if one of your canvas objects was clicked
    if (x.mouseToCanvas?.canvasXY) {
      const canvasXY = x.mouseToCanvas.canvasXY;
      if (this.rectangle.x < canvasXY.x && canvasXY.x < this.rectangle.x + this.rectangle.width) {
        if (this.rectangle.y < canvasXY.y && canvasXY.y < this.rectangle.y + this.rectangle.height) {
          console.log ('Hit a rectangle!');
        }
      }
    }
  }

  Draw(x: SmartCanvasInfo) {    
    x.ctx.fillStyle = 'grey';
    x.ctx.strokeStyle = 'black';
    //CanvasHelper comes with library. has calculations for translating mouse to canvas and a rounded rectangle drawer
    CanvasHelper.roundRect(x.ctx, this.rectangle.x, this.rectangle.y, this.rectangle.width, this.rectangle.height, 5);
    x.ctx.fill();
  }


  toggleSidebar() {
    this.showSideBar = !this.showSideBar
  }

}