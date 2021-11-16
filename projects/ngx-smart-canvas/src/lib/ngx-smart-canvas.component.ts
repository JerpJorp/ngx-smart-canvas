import { ThrowStmt } from '@angular/compiler';
import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject  } from 'rxjs';
import { retry } from 'rxjs/operators';
import { SmartCanvasSettings } from '../public-api';
import { CanvasHelper } from './classes/canvas-helper';
import { MouseToCanvas } from './classes/mouse-to-canvas';
import { SmartCanvasInfo } from './classes/smart-canvas-info';
import { NgxSmartCanvasService } from './ngx-smart-canvas.service';

@Component({
  selector: 'lib-ngx-smart-canvas',
  templateUrl: './ngx-smart-canvas.component.html',
  styles: [
    '.canvas-container { overflow: hidden; position: relative}',
    '.canvas-container-scrollable { overflow: auto }',
    '.canvas-container-noscroll { overflow: hidden }',
    '.canvas-overlay { z-index:2; position:absolute; top:10px; left:10px} ',
    '.floating-button { background-color: rgba(20,20,20, 0.05); border: 1px solid rgba(50,50,50,0.2); margin: 5px;}'
  ]
})
export class NgxSmartCanvasComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() settings: SmartCanvasSettings = new SmartCanvasSettings();

  // all events are pushed through a service.  if client is using multiiple smart canvas components they can assign a different id so they know which one is 
  // is publishing a service event and react accordingly   
  @Input() componentId = '1';  //

  // All functionality is based on canvas element and it's CanvasRenderingContext2D, which is captured during ngOnInit
  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;
  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  dragStart: { x: number, y: number } | undefined ;
  dragEnd: { x: number, y: number } = { x: 0, y: 0 };

  showReset = false;

  private destroyed$: Subject<void> = new Subject<void>();

  constructor(private svc: NgxSmartCanvasService) { }

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d');    
  }

  ngAfterViewInit(): void {
    this.svc.ready$.next(this.createInfo(undefined));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
 
  canvasWheel(event: WheelEvent) {
    if (this.ctx && this.settings.zoomable) {
      const txfrmA = this.ctx.getTransform().a;

      const ctrlModifier = event.ctrlKey ? this.settings.ctrlZoomMultiplier : 1;
      const shiftModifer = event.ctrlKey ? this.settings.altZoomMultiplier  : 1;

      let scaleDelta = event.deltaY > 0 ? 0.1 : -0.1;

      scaleDelta *= ctrlModifier;
      scaleDelta *= shiftModifer;

      if (txfrmA < this.settings.minimumZoom && scaleDelta < 0 ) {
        //minimum zoom
        return false;
      }

      if (txfrmA > this.settings.maximumZoom && scaleDelta  > 0) {
        //maximum zoom
        return false;
      }
     
      //adjust delta for current zoom amount (txfrmA)
      const scaleDeltaNormalized = scaleDelta / txfrmA;
      const scaleFactor = scaleDeltaNormalized + 1;

      const translatedXY = CanvasHelper.MouseToCanvas(this.ctx.canvas, this.ctx, event);

      const coords = translatedXY.canvasXY;
      const mouseCoords = translatedXY.canvasMouseXy;

      this.ctx.translate(mouseCoords.x, mouseCoords.y);
      this.ctx.scale(scaleFactor, scaleFactor);
      this.ctx.translate(mouseCoords.x * -1, mouseCoords.y * -1);


      // const coords = translatedXY.canvasXY;
      // this.ctx.translate(coords.x * scaleFactor, coords.y * scaleFactor);
      // this.ctx.scale(scaleFactor, scaleFactor);
      // this.ctx.translate(coords.x * -1 * scaleFactor - scaleDelta, coords.y * -1 *scaleFactor - scaleDelta);


      this.redrawRequest(this.ctx);

      return false;
    }
    return true;
  }

  canvasMouseOver(event: any) {
    if (this.ctx) {
      const element = this.canvas?.nativeElement as HTMLCanvasElement
      const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);
      this.svc.mouseOver$.next(this.createInfo(translatedXY));
    }
  }
  
  canvasDoubleClick(event: MouseEvent) {
    if (this.ctx) {
      const element = this.canvas?.nativeElement as HTMLCanvasElement
      const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);
      this.svc.doubleClick$.next(this.createInfo(translatedXY));
    }
  }

  canvasMouseClick(event: MouseEvent) {
    if (this.ctx) {
      const element = this.canvas?.nativeElement as HTMLCanvasElement
      const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);
      this.svc.click$.next(this.createInfo(translatedXY));
    }
  }

  canvasDragStart(event: DragEvent) { 
    this.dragStart = { x: event.x, y: event.y }
  }

  canvasDrop(event: DragEvent) { 
    
    if (this.dragStart) {
      this.dragEnd = { x: event.x, y: event.y }

      if (this.ctx) {      
        this.clear(this.ctx);
        const txfrm = this.ctx.getTransform();      
        this.ctx?.translate((this.dragEnd.x - this.dragStart.x) / txfrm.a, (this.dragEnd.y - this.dragStart.y) / txfrm.d);
        this.redrawRequest(this.ctx);
      }
      this.dragStart = undefined;

    }
  }

  canvasDragOver(event: any) { 
    if (this.dragStart) {
      event.preventDefault(); // allow dropping into here as it is the source of drag
    }
    
  }

  resetCanvasZoom() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.ctx.setTransform(1,0,0,1,txfrm.e,txfrm.f);
      this.redrawRequest(this.ctx);
    }
  }

  resetCanvasCenter() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.ctx.setTransform(txfrm.a,0,0,txfrm.d,0,0);
      this.redrawRequest(this.ctx);
    }
  }

  resetCanvas() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.ctx.setTransform(txfrm.a,0,0,txfrm.d,0,0);
      this.redrawRequest(this.ctx);
    }
  }

  private redrawRequest(ctx: CanvasRenderingContext2D) {
    CanvasHelper.clear(ctx);
    this.svc.redrawRequest$.next(this.createInfo(undefined));
    this.checkShowReset();
  }

  clear(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Will always clear the right space
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.restore();
    
  }

  checkShowReset() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.showReset = txfrm.a !== 1 || txfrm.f !== 0;
    }
  }

  private createInfo(mouseToCanvas: MouseToCanvas | undefined) : SmartCanvasInfo {
    return new SmartCanvasInfo(this.componentId, this.canvas?.nativeElement as HTMLCanvasElement, this.ctx as CanvasRenderingContext2D, mouseToCanvas)
  }

}
