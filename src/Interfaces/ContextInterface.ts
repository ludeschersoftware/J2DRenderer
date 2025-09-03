interface ContextInterface {
    clear(color?: string): void;
    drawSprite(image: HTMLImageElement, x: number, y: number, w: number, h: number): void;
    drawText(text: string, x: number, y: number, color?: string, font?: string): void;
    present(): void;
}

export default ContextInterface;