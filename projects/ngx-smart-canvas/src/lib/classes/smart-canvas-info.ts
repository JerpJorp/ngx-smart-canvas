import { MouseToCanvas } from "./mouse-to-canvas";

export class SmartCanvasInfo {

    // mouseToCanvas: MouseToCanvas |  undefined;

    constructor(public componentId: string, public canvas: HTMLCanvasElement, public ctx: CanvasRenderingContext2D, public mouseToCanvas: MouseToCanvas |  undefined) {}


}
