import { MouseToCanvas } from "./mouse-to-canvas";

export class CanvasHelper {

    static MouseXY(canvas: HTMLCanvasElement, event: MouseEvent): {x: number, y: number} {
        const bcr = canvas.getBoundingClientRect(); // abs. size of element
        const scaleX = canvas.width / bcr.width;    // relationship bitmap vs. element for X
        const scaleY = canvas.height / bcr.height;  // relationship bitmap vs. element for Y
        return {
            x: (event.clientX - bcr.left) * scaleX,
            y: (event.clientY - bcr.top) * scaleY
        }
    }

    static GetCanvasCoords = function(ctx: CanvasRenderingContext2D, mouseXY:  {x: number, y: number}): {x: number, y: number} {
        const matrix = ctx.getTransform();
        const imatrix = matrix.invertSelf();
        let x = mouseXY.x * imatrix.a + mouseXY.y * imatrix.c + imatrix.e;
        let y = mouseXY.x * imatrix.b + mouseXY.y * imatrix.d + imatrix.f;
        return {x: x, y: y};
      }

    static MouseToCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, event: MouseEvent): MouseToCanvas {

        const canvasMouseXY = this.MouseXY(canvas, event);

        const canvasXY =  this.GetCanvasCoords(ctx, canvasMouseXY)

        return new MouseToCanvas(event, canvasMouseXY, canvasXY)

    }

    static clear(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        // Will always clear the right space
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.restore();    
    }

    static  roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        return this;
    }
}
