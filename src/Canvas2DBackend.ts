import ContextInterface from "./Interfaces/ContextInterface";

class Canvas2DBackend implements ContextInterface {
    private m_context: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Canvas2D not supported");

        this.m_context = context;
    }

    public Clear(color: string = "black"): void {
        this.m_context.fillStyle = color;
        this.m_context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public DrawSprite(image: HTMLImageElement, x: number, y: number, w: number, h: number): void {
        this.m_context.drawImage(image, x, y, w, h);
    }

    public DrawText(text: string, x: number, y: number, color: string = "white", font: string = "16px Arial"): void {
        this.m_context.fillStyle = color;
        this.m_context.font = font;
        this.m_context.fillText(text, x, y);
    }

    public Present(): void {
        // In Canvas2D, nothing special to present, the context auto-flushes
    }
}

export default Canvas2DBackend;