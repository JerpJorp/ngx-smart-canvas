# NgxSmartCanvas
This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

The library contains a component that hosts a canvas element and manages interactions by the user for tranlating (by dragging mouse) and zooming (using mouse wheel).

You as the client application can draw to the canvas.  The library service NgxSmartCanvas uses observables to let you know 
* when the component is ready
* when you need to redraw content on the canvas
* when a user has clicked or moved their mouse
    * you will also received normalized canvas coordinates for mouse related events

All observables provide the following:
```javascript
class SmartCanvasInfo  {
    componentId: string;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    mouseToCanvas: MouseToCanvas |  undefined; // only for mouse move/click events
}
```

"mouseToCanvas" object:
```javascript
class MouseToCanvas {
    mouseEvent: MouseEvent;  // Mouse click/move information
    canvasMouseXy: {x: number, y: number}; // where mouse x/y are on the canvas
    public canvasXY: {x: number, y: number}; // x/y normalized against canvas scale/translate/skew
}

```
The component will capture user mouse down/drag/up as well as scroll wheel activity and provide translate/scale operations accordingly.  When any of these transforms occur, it will request you to draw again (via redrawRequest$).  You don't have to do anything but draw normally as the transform has already been set and will appear as the user expects it.  See code example below for a pattern where ready$ and redrawRequest$ are sent to Draw method.  As long as you draw whatever you want in that method, it will get redrawn correctly with every scale/translate.

# Example angular component;
## HTML
```html
<lib-ngx-smart-canvas></lib-ngx-smart-canvas>
```
## Component class
```javascript
constructor(private smartCanvasSvc: NgxSmartCanvasService) {}
 
  ngOnInit(): void {
    this.smartCanvasSvc.ready$.pipe(filter(x => x !== undefined)).subscribe(x => { this.Draw(x)});
    this.smartCanvasSvc.redrawRequest$.subscribe(x => {this.Draw(x)});
    this.smartCanvasSvc.click$.subscribe(x => this.CanvasClick(x));
    this.smartCanvasSvc.mouseOver$.subscribe(x => this.CanvasMouseOver(x));
    
    // at any time once the canvas is ready, you can draw to it via
    //       this.smartCanvasSvc.ready$.value?.ctx
    // or grab a reference to context on the ready$ subscription firing
  }
  
  CanvasMouseOver(x: SmartCanvasInfo): void {    
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
    // this will work if the user has moved around (translate) or zoomed in/out (mouse wheel)
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
  ```
 ## lib-ngx-smart-canvas inputs 
  ```javascript
    //  true -> wheel zooms in and out. false -> wheel is handled normally (scroll)
  @Input() zoomable = true; 

  // debounce lag when user moves around mouse on canvas.  Affects dragging and mouseover frequency.  Higher number isn't as fluid but less processor intensive
  @Input() mouseMoveDebounceTime = 1; 

  // all events are pushed through a service.  if client is using multiiple smart canvas components they can assign a different id so they know which one is 
  // is publishing a service event and react accordingly   
  @Input() componentId = '1';  //
  ```
  ## css classes you can twead 
  ```
'.canvas-container { height: 90vh; border: 1px solid rgba(250,250,250,.125); position: relative}',
'.canvas-container-scrollable { overflow: auto }',
'.canvas-container-noscroll { overflow: hidden }',
'.canvas-overlay { z-index:2; position:absolute; top:10px; left:10px} '
``` 
 
## Code scaffolding

Run `ng generate component component-name --project ngx-smart-canvas` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-smart-canvas`.
> Note: Don't forget to add `--project ngx-smart-canvas` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ngx-smart-canvas` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ngx-smart-canvas`, go to the dist folder `cd dist/ngx-smart-canvas` and run `npm publish`.

## Running unit tests

Run `ng test ngx-smart-canvas` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
