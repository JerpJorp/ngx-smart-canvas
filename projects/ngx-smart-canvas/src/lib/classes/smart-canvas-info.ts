import { MouseToCanvas } from "./mouse-to-canvas";

export class SmartCanvasInfo {
    constructor(
        public componentId: string, 
        public canvas: HTMLCanvasElement, 
        public ctx: CanvasRenderingContext2D, 
        public mouseToCanvas: MouseToCanvas |  undefined) {}
}
