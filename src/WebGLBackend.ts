import ContextInterface from "./Interfaces/ContextInterface";

class WebGLBackend implements ContextInterface {
    private gl: WebGLRenderingContext;

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl");
        if (!gl) throw new Error("WebGL not supported");
        this.gl = gl;
    }

    clear(color: string = "black"): void {
        const [r, g, b] = this.hexToRGB(color);
        this.gl.clearColor(r, g, b, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    drawSprite(image: HTMLImageElement, x: number, y: number, w: number, h: number): void {
        // Real implementation would require shader + buffer setup.
        // Here you'd upload the texture and draw a quad.
        console.log("WebGL sprite draw not fully implemented yet.");
    }

    drawText(): void {
        // WebGL doesn’t have text — you'd need bitmap fonts.
        console.warn("WebGL text drawing not implemented. Use bitmap fonts.");
    }

    present(): void {
        // In WebGL, rendering happens immediately once you call draw commands.
    }

    private hexToRGB(hex: string): [number, number, number] {
        const bigint = parseInt(hex.replace("#", ""), 16);
        return [
            ((bigint >> 16) & 255) / 255,
            ((bigint >> 8) & 255) / 255,
            (bigint & 255) / 255,
        ];
    }
}

export default WebGLBackend;