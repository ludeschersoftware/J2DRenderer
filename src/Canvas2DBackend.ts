import ContextInterface from "./Interfaces/ContextInterface";

class Canvas2DBackend implements ContextInterface {
    private ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas2D not supported");
        this.ctx = context;
    }

    clear(color: string = "black"): void {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSprite(image: HTMLImageElement, x: number, y: number, w: number, h: number): void {
        this.ctx.drawImage(image, x, y, w, h);
    }

    drawText(text: string, x: number, y: number, color: string = "white", font: string = "16px Arial"): void {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
    }

    present(): void {
        // In Canvas2D, nothing special to present, the context auto-flushes
    }
}

export default Canvas2DBackend;