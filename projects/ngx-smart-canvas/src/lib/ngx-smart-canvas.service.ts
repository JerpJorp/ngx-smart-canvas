import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { SmartCanvasInfo } from '../public-api';

@Injectable({
  providedIn: 'root'
})
export class NgxSmartCanvasService {

  ready$: BehaviorSubject<SmartCanvasInfo | undefined> = new BehaviorSubject<SmartCanvasInfo| undefined>(undefined);

  redrawRequest$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();

  click$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();

  mouseOver$: Subject<SmartCanvasInfo> = new Subject<SmartCanvasInfo>();

  constructor() { }
}
