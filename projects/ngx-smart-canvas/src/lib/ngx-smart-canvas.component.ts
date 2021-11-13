import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MouseToCanvas, SmartCanvasInfo } from '../public-api';

import { CanvasHelper } from './classes/canvas-helper';
import { NgxSmartCanvasService } from './ngx-smart-canvas.service';

@Component({
  selector: 'lib-ngx-smart-canvas',
  templateUrl: './ngx-smart-canvas.component.html',
  styles: [
    '.canvas-container { height: 90vh; border: 1px solid rgba(250,250,250,.125); overflow: hidden; position: relative}',
    '.canvas-container-scrollable { overflow: auto }',
    '.canvas-container-noscroll { overflow: hidden }',
    '.canvas-overlay { z-index:2; position:absolute; top:10px; left:10px} '
  ]
})
export class NgxSmartCanvasComponent implements OnInit, OnDestroy, OnChanges {

  //  true -> wheel zooms in and out. false -> wheel is handled normally (scroll)
  @Input() zoomable = true; 

  // debounce lag when user moves around mouse on canvas.  Affects dragging and mouseover frequency.  Higher number isn't as fluid but less processor intensive
  @Input() mouseMoveDebounceTime = 1; 

  // all events are pushed through a service.  if client is using multiiple smart canvas components they can assign a different id so they know which one is 
  // is publishing a service event and react accordingly   
  @Input() componentId = '1';  //

  // All functionality is based on canvas element and it's CanvasRenderingContext2D, which is captured during ngOnInit
  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;
  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  drag = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  dragEnd: { x: number, y: number } = { x: 0, y: 0 };

  moveDebounce: Subject<MouseEvent> = new Subject<MouseEvent>();
  moveDebounceSubscription: Subscription | undefined;

  showReset = false;

  private destroyed$: Subject<void> = new Subject<void>();

  constructor(private svc: NgxSmartCanvasService) { 
    this.setDebounceTime();
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mouseMoveDebounceTime']) {
      this.setDebounceTime();
    }
  }

  ngOnInit(): void {
    this.ctx = this.canvas?.nativeElement.getContext('2d');
    this.svc.ready$.next(this.createInfo(undefined));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  canvasMouseDown(event: MouseEvent) {

    if (this.ctx ) {
      const element = this.canvas?.nativeElement as HTMLCanvasElement
      const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);
      this.svc.click$.next(this.createInfo(translatedXY));

      this.dragStart = {
        x: event.pageX - element.offsetLeft,
        y: event.pageY - element.offsetTop
      }

      this.drag = true;
    }
  }

  canvasWheel(event: WheelEvent) {
    if (this.ctx && this.zoomable) {

      const txfrmA = this.ctx.getTransform().a;
      let inverter = event.deltaY > 0 ? 0.1 : -0.1;

      inverter = inverter / txfrmA;
      
      const translatedXY = CanvasHelper.MouseToCanvas(this.ctx.canvas, this.ctx, event);

      this.ctx.translate(translatedXY.canvasXY.x* txfrmA, translatedXY.canvasXY.y* txfrmA);
      this.ctx.scale(1 + inverter, 1 + inverter);
      this.ctx.translate(translatedXY.canvasXY.x*-1* txfrmA, translatedXY.canvasXY.y*-1* txfrmA);
      CanvasHelper.clear(this.ctx);
      this.svc.redrawRequest$.next(this.createInfo(undefined));
      this.checkShowReset();
      return false  
    }
    return true;
  }

  canvasMouseClick(event: MouseEvent) {
    this.drag = false;
  }

  canvasMouseMove(event: MouseEvent) {

    if (this.ctx) {
      if (this.drag) {
        this.moveDebounce.next(event);
      } else {
        const element = this.canvas?.nativeElement as HTMLCanvasElement;
        const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);
        this.svc.mouseOver$.next(this.createInfo(translatedXY));
      }
    }
  }

  debounceMouseMove(event: MouseEvent) {

    const element = this.canvas?.nativeElement as HTMLCanvasElement;

    this.dragEnd = {
      x: event.pageX - element.offsetLeft,
      y: event.pageY - element.offsetTop
    }

    if (this.ctx) {      
      this.clear(this.ctx);
      const txfrm = this.ctx.getTransform();      
      this.ctx?.translate((this.dragEnd.x - this.dragStart.x) / txfrm.a, (this.dragEnd.y - this.dragStart.y) / txfrm.d);
      this.dragStart = this.dragEnd;

      CanvasHelper.clear(this.ctx);
      this.svc.redrawRequest$.next(this.createInfo(undefined));      
      this.checkShowReset();
    }
  }

  resetCanvasZoom() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.ctx.setTransform(1,0,0,1,txfrm.e,txfrm.f);
      CanvasHelper.clear(this.ctx);
      this.svc.redrawRequest$.next(this.createInfo(undefined));      
    }
  }

  resetCanvasCenter() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.ctx.setTransform(txfrm.a,0,0,txfrm.d,0,0);
      CanvasHelper.clear(this.ctx);
      this.svc.redrawRequest$.next(this.createInfo(undefined));      
    }
  }

  resetCanvas() {
    if (this.ctx) {
      const txfrm = this.ctx.getTransform();
      this.ctx.setTransform(txfrm.a,0,0,txfrm.d,0,0);
      CanvasHelper.clear(this.ctx);
      this.svc.redrawRequest$.next(this.createInfo(undefined));
    }
  }

  clear(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Will always clear the right space
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.restore();
    
  }

  setDebounceTime() {
    if (this.moveDebounceSubscription) {
      this.moveDebounceSubscription.unsubscribe();
    }
    this.moveDebounceSubscription = this.moveDebounce.pipe(debounceTime(this.mouseMoveDebounceTime)).subscribe(x => this.debounceMouseMove(x));
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
