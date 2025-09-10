import CanvasInterface from "../Interfaces/CanvasInterface";

class CanvasManager {
    protected m_stack: Map<number, CanvasInterface>;

    public constructor() {
        this.m_stack = new Map();
    }

    public get stackCount(): number {
        return this.m_stack.size;
    }

    private clearContext2ds(): void {
        for (let x = 0; x < this.m_canvas_stack.length; x++) {
            const CANVAS: CanvasInterface = this.m_canvas_stack[x];

            CANVAS.Context2d!.setTransform(1, 0, 0, 1, 0, 0);
            CANVAS.Context2d!.clearRect(0, 0, CANVAS.Context2d.canvas.width, CANVAS.Context2d.canvas.height);
        }
    }

    private updateCanvasStack(): void {
        if (this.m_scene_manager.activeScene!.Layers.length < this.m_canvas_stack.length) {
            const CANVAS_DIFF: number = this.m_canvas_stack.length - this.m_scene_manager.activeScene!.Layers.length;

            for (let x = 0; x < CANVAS_DIFF; x++) {
                this.m_canvas_stack.pop()!.Element.remove();
            }

            this.optimizeCanvas();

            return;
        }

        const CANVAS_DIFF: number = this.m_scene_manager.activeScene!.Layers.length - this.m_canvas_stack.length;

        for (let x = 0; x < CANVAS_DIFF; x++) {
            /**
             * Create all required Canvas Elements
             * 
             * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#use_multiple_layered_canvases_for_complex_scenes
             */

            const NEW_CANVAS_ELEMENT: HTMLCanvasElement = createElement('canvas', {
                className: '2drenderer-canvas',
                width: this.m_config.Container.offsetWidth,
                height: this.m_config.Container.offsetHeight,
                style: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    zIndex: '1',
                },
            });

            /**
             * Create all required Canvas Context objects
             *
             * Note:
             * The background context doesn't have to be transparent
             * 
             * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#turn_off_transparency
             */

            this.m_canvas_stack.unshift({
                Context2d: NEW_CANVAS_ELEMENT.getContext("2d")!,
                Element: NEW_CANVAS_ELEMENT,
            });

            this.m_config.Container.prepend(NEW_CANVAS_ELEMENT);
        }

        this.optimizeCanvas();
    }

    /**
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#scaling_for_high_resolution_displays
     */
    private optimizeCanvas(): void {

        /**
         * Get the DPR and size of the canvas
         */

        const DPR: number = window.devicePixelRatio;
        const CONTAINER_RECT: DOMRect = this.m_config.Container.getBoundingClientRect();

        /**
         * Set the "actual" size of the canvas
         */

        for (let x = 0; x < this.m_canvas_stack.length; x++) {
            const CANVAS: CanvasInterface = this.m_canvas_stack[x];

            CANVAS.Element.width = CONTAINER_RECT.width * DPR;
            CANVAS.Element.height = CONTAINER_RECT.height * DPR;
        }

        this.m_config.Canvas.width = CONTAINER_RECT.width * DPR;
        this.m_config.Canvas.height = CONTAINER_RECT.height * DPR;
        this.m_config.Canvas.x = CONTAINER_RECT.x;
        this.m_config.Canvas.y = CONTAINER_RECT.y;
        this.m_config.Scale = DPR;

        /**
         * Scale the context to ensure correct drawing operations
         */

        for (let x = 0; x < this.m_canvas_stack.length; x++) {
            this.m_canvas_stack[x].Context2d.scale(DPR, DPR);
        }

        /**
         * Set the "drawn" size of the canvas
         */

        for (let x = 0; x < this.m_canvas_stack.length; x++) {
            const CANVAS: CanvasInterface = this.m_canvas_stack[x];

            CANVAS.Element.style.width = `${CONTAINER_RECT.width}px`;
            CANVAS.Element.style.height = `${CONTAINER_RECT.height}px`;
        }

        this.m_event_layer_element!.style.width = `${CONTAINER_RECT.width}px`;
        this.m_event_layer_element!.style.height = `${CONTAINER_RECT.height}px`;
    }
}

export default CanvasManager;