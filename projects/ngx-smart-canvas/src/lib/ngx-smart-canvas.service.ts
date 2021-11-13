import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SmartCanvasInfo } from '../public-api';

@Injectable({
  providedIn: 'root'
})
export class NgxSmartCanvasService {

  redrawRequest$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();
  ready$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();

  click$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();

  mouseOver$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();

  constructor() { }
}
