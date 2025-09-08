interface ContextInterface {
    Clear(color?: string): void;
    DrawSprite(image: HTMLImageElement, x: number, y: number, w: number, h: number): void;
    DrawText(text: string, x: number, y: number, color?: string, font?: string): void;
    Present(): void;
}

export default ContextInterface;