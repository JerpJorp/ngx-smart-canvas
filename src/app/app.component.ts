import { Component, OnInit } from '@angular/core';

import { CanvasHelper, NgxSmartCanvasService, SmartCanvasInfo } from 'ngx-smart-canvas';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showSideBar = true;

  rectangles: Rectangle[] = [];
  rectangle = new Rectangle();
  lastMessage = ''

  lastUIRectangle: Rectangle | undefined;

  constructor(private smartCanvasSvc: NgxSmartCanvasService) {}

  ngOnInit(): void {

    this.smartCanvasSvc.ready$.pipe(filter(x => x !== undefined)).subscribe(x => { this.Draw(x as SmartCanvasInfo)});
    this.smartCanvasSvc.redrawRequest$.subscribe(x => {this.Draw(x)});
    this.smartCanvasSvc.click$.subscribe(x => this.CanvasClick(x));
    this.smartCanvasSvc.doubleClick$.subscribe(x => this.CanvasDoubleClick(x));
    this.smartCanvasSvc.mouseOver$.subscribe(x => this.CanvasMouseOver(x));

    Array(5).fill(0).forEach( (v, rowIdx) => {
      Array(5).fill(0).forEach( (v, colIdx) => {
        const x = this.rectangle.x + (this.rectangle.width + 20) * rowIdx;
        const y = this.rectangle.y + (this.rectangle.height + 20) * colIdx;
        const newR = new Rectangle();
        newR.x = x;
        newR.y = y;
        newR.name = `${rowIdx},${colIdx}`;
        this.rectangles.push(newR);              
      });      
    });

  }

  find(x: SmartCanvasInfo): Rectangle | undefined {
    if (x.mouseToCanvas?.canvasXY) {
      const canvasXY = x.mouseToCanvas.canvasXY;
      return this.rectangles.find(r => r.x < canvasXY.x && canvasXY.x < r.x + r.width && r.y < canvasXY.y && canvasXY.y < r.y + r.height);
    } else {
      return undefined;
    }
  }

  CanvasMouseOver(x: SmartCanvasInfo): void {
    const match = this.find(x);
    
    if (match) {

      const same = this.lastUIRectangle !== undefined && this.lastUIRectangle.x === match.x && this.lastUIRectangle.y === match.y;
      if (!same) {
        this.lastMessage = `hovered over ${x.componentId} ${match.name}`;
        this.lastUIRectangle = match;
      }
      
    }
  }

  CanvasDoubleClick(x: SmartCanvasInfo): void {
    const match = this.find(x);
    if (match) {
      this.lastMessage = `double clicked on ${x.componentId} ${match.name}`;
      this.lastUIRectangle = match;
    }
  }

  CanvasClick(x: SmartCanvasInfo): void {

    
    //  raw mouse event x/y
    console.log(`Mouse X/y: ${x.mouseToCanvas?.mouseEvent.x}, ${x.mouseToCanvas?.mouseEvent.y}`);

    // where mouse is on canvas element
    console.log(`Canvas Element X/y: ${x.mouseToCanvas?.canvasMouseXy.x}, ${x.mouseToCanvas?.canvasMouseXy.y}`);

    // where x/y actually fall on original canvas drawing (adjusted for scale/skew/scroll)
    console.log(`Canvas Coordinates X/y: ${x.mouseToCanvas?.canvasXY.x}, ${x.mouseToCanvas?.canvasXY.y}`);

    const match = this.find(x);
    if (match) {
      this.lastMessage = `clicked on ${x.componentId} ${match.name}`;
      this.lastUIRectangle = match;
    }

  }

  Draw(sci: SmartCanvasInfo) {    
    sci.ctx.fillStyle = sci.componentId === 'A' ? '#dddddd' : '#ddddff';
    sci.ctx.strokeStyle = 'black';

    this.rectangles.forEach(r => {
      CanvasHelper.roundRect(sci.ctx, r.x, r.y, r.width, r.height, 5);
      sci.ctx.fill();
    });
  }


  toggleSidebar() {
    this.showSideBar = !this.showSideBar
  }

}

class Rectangle {
  x = 100;
  y = 100;
  width = 100;
  height = 40;
  name = '';
}