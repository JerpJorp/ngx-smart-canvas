import { Component, OnInit } from '@angular/core';

import { CanvasHelper, NgxSmartCanvasService, SmartCanvasInfo } from 'ngx-smart-canvas';
import { HelperLine, IHelperPoint } from 'projects/ngx-smart-canvas/src/public-api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showSideBar = true;

  rectangles: Rectangle[] = [];

  lines: Rectangle[] = [
    {x: 100, y: 100, width: 100, height: 0, name: 'red'},
    {x: 100, y: 100, width: 100, height: 100, name: 'green'},
    {x: 100, y: 100, width: 50, height: 100, name: 'blue'},
    {x: 100, y: 100, width: -100, height: -70, name: 'black'},
  ];

  rectangle = new Rectangle();
  lineMessage = '';
  nodeMessage = '';

  lastUIRectangle: Rectangle | undefined;

  lineRectangle: Rectangle | undefined;

  constructor(private smartCanvasSvc: NgxSmartCanvasService) {}

  ngOnInit(): void {

    this.smartCanvasSvc.ready$.pipe(filter(x => x !== undefined)).subscribe(x => { this.Draw(x as SmartCanvasInfo)});
    this.smartCanvasSvc.redrawRequest$.subscribe(x => {this.Draw(x)});
    this.smartCanvasSvc.click$.subscribe(x => this.CanvasClick(x));
    this.smartCanvasSvc.doubleClick$.subscribe(x => this.CanvasDoubleClick(x));
    this.smartCanvasSvc.mouseOver$.subscribe(x => this.CanvasMouseOver(x));

    Array(20).fill(0).forEach( (v, rowIdx) => {
      Array(20).fill(0).forEach( (v, colIdx) => {
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
    
    const lineMatch = CanvasHelper.LineHit(this.lines.map(l => this.toHelperLine(l)), x.mouseToCanvas?.canvasXY as IHelperPoint, 20);
    this.lineMessage = lineMatch ? 'line ' + lineMatch.id : '';

    if (match) {
      const same = this.lastUIRectangle !== undefined && this.lastUIRectangle.x === match.x && this.lastUIRectangle.y === match.y;
      if (!same) {
        this.nodeMessage = `hovered over ${x.componentId} ${match.name}`;
        this.lastUIRectangle = match;
      }      
    }

    if (this.lineRectangle) {
      // old
      x.ctx.clearRect(this.lineRectangle.x, this.lineRectangle.y, this.lineRectangle.width, this.lineRectangle.height);
      
    }

    if (lineMatch) {
      const r = {
        x: lineMatch.midpoint.x - 10,
        y: lineMatch.midpoint.y - 10,
        width: 20,
        height: 20,
        name: lineMatch.id
      }

      this.lineRectangle = r;

      x.ctx.fillStyle = 'white';
      // CanvasHelper.roundRect(x.ctx, r.x , r.y, r.width, r.height, 1);
      x.ctx.fill();
      x.ctx.fillStyle = 'black';    
      x.ctx.fillText(lineMatch.id, r.x, r.y+10, r.width);
    } else {
      this.lineRectangle = undefined;
    }
  }

  toHelperLine(rect: Rectangle): HelperLine {
    return new HelperLine(
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      rect.name
    );
  }

  CanvasDoubleClick(x: SmartCanvasInfo): void {
    const match = this.find(x);
    if (match) {
      this.nodeMessage = `double clicked on ${x.componentId} ${match.name}`;
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
      this.nodeMessage = `clicked on ${x.componentId} ${match.name}`;
      this.lastUIRectangle = match;
    }

  }

  Draw(sci: SmartCanvasInfo) {

    const rectColor = sci.componentId === 'A' ? '#dddddd' : '#ddddff';
    let i = 0;
    
    sci.ctx.strokeStyle = 'black';

    this.rectangles.forEach(r => {
      sci.ctx.fillStyle = rectColor;
      CanvasHelper.roundRect(sci.ctx, r.x, r.y, r.width, r.height, 5);
      sci.ctx.fill();
      sci.ctx.fillStyle = 'black';    
      sci.ctx.fillText(`${i++}`, r.x + 3, r.y + 4);
    });

    this.lines.forEach(line => {

      sci.ctx.strokeStyle = line.name;
      sci.ctx.beginPath();
      sci.ctx.moveTo(line.x, line.y);
      sci.ctx.lineTo(line.x + line.width, line.y + line.height);
      sci.ctx.stroke();
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