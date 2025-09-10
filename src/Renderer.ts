import { createElement } from "@ludeschersoftware/dom";
import AbstractComponent from "./Abstract/AbstractComponent";
import { Mat3 } from "gl-matrix";
import GlobalConfigInterface from "./Interfaces/GlobalConfigInterface";
import CanvasInterface from "./Interfaces/CanvasInterface";
import InitConfigInterface from "./Interfaces/InitConfigInterface";
import { initializeConfig, setConfig } from "./Config";
import EventHub from "./EventHub";
import LogLog from "./Logger";
import SceneManager from "./Manager/SceneManager";
import AbstractScene from "./Abstract/AbstractScene";
import BlankWindow from "./BlankWindow";
import InputManager from "./Inputs/InputManager";
import RenderTime from "./RenderTime";
import CanvasManager from "./Manager/CanvasManager";

class Renderer {
    protected m_config: GlobalConfigInterface;
    protected m_scene_manager: SceneManager;
    protected m_render_time: RenderTime;
    protected m_canvas_manager: CanvasManager;
    protected m_input_manager: InputManager;
    protected m_blank_window: BlankWindow;

    constructor(config: InitConfigInterface) {
        initializeConfig();

        const { Container, Id, Logger, ...rest } = config;
        const CONTAINER_RECT: DOMRect = Container.getBoundingClientRect();

        this.m_config = {
            ...{
                Id,
                Container,
                Viewport: {
                    width: Container.offsetWidth,
                    height: Container.offsetHeight,
                    x: CONTAINER_RECT.x,
                    y: CONTAINER_RECT.y,
                },
                Scale: 1,
                EventHub: new EventHub(Container),
                Logger: new LogLog(Logger),
            }, ...rest
        };
        this.m_scene_manager = new SceneManager(this.m_config);
        this.m_render_time = new RenderTime();
        this.m_canvas_manager = new CanvasManager();
        this.m_input_manager = new InputManager(Container, this.m_config);
        this.m_blank_window = new BlankWindow(Container, this.m_config);

        setConfig(Id, this.m_config);

        document.addEventListener('contextmenu', e => e?.cancelable && e.preventDefault());
    }

    public SetLoadingScene(scene: AbstractScene): void {
        this.m_scene_manager.SetLoadingScene(scene);
    }

    public RegisterScene(scene: AbstractScene): void {
        this.m_scene_manager.RegisterScene(scene);
    }

    public IsSceneRegistered(scene_id: string): boolean {
        return this.m_scene_manager.IsSceneRegistered(scene_id);
    }

    public async RunAsync(scene_id: string): Promise<void> {
        this.clearContext2ds();

        await this.m_scene_manager.initializeLoadingScene();

        this.m_scene_manager.LoadScene(scene_id);

        requestAnimationFrame(this.renderLoop);
    }

    private renderLoop = (now: number) => {
        now *= 0.001;

        const DELTA_TIME: number = now - this.m_now;

        this.m_now = now;

        /**
         * Check Canvas state
         */

        if (this.m_scene_manager.activeScene!.layerCount !== this.m_canvas_manager.stackCount) {
            this.updateCanvasStack();
        }

        /**
         * Update Input state
         */

        this.m_input_manager.Update();

        /**
         * Update all Components in reverse order
         */

        for (const layer of this.m_scene_manager.activeScene!.ReverseLayers()) {
            for (const component of layer.ReverseComponents()) {
                this.updateComponent(component, DELTA_TIME, this.m_input_state);
            }
        }

        /**
         * Draw all Components
         */

        this.clearContext2ds();

        if (this.m_config.Camera !== undefined) {
            for (let x = 0; x < this.m_scene_manager.activeScene!.Layers.length; x++) {
                const APPLY_CAMERA: boolean = this.m_scene_manager.activeScene!.Layers[x].applyCamera;

                if (APPLY_CAMERA === false) {
                    continue;
                }

                const CANVAS: CanvasInterface = this.m_canvas_stack[x];
                const CANVAS_TRANSFORM: Mat3 = this.m_config.Camera.GetViewProjectionMatrix();

                CANVAS.Context2d!.setTransform(CANVAS_TRANSFORM[0], CANVAS_TRANSFORM[1], CANVAS_TRANSFORM[3], CANVAS_TRANSFORM[4], CANVAS_TRANSFORM[6], CANVAS_TRANSFORM[7]);
            }
        }

        for (const layer of this.m_scene_manager.activeScene!.Layers()) {
            for (const component of layer.Components()) {
                this.drawComponent(component, this.m_canvas_stack[x]!.Context2d, DELTA_TIME);
            }
        }

        if (this.m_scene_manager.moveToNextScene()) {
            this.m_input_manager.Reset();
        }

        requestAnimationFrame(this.renderLoop);
    };

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

    private updateComponent(component: AbstractComponent, deltaTime: number, inputManager: InputManager): false | void {
        component.Update(deltaTime, inputState);

        for (const child of component.ReverseComponents()) {
            this.updateComponent(child, deltaTime, inputState);
        }
    }

    private drawComponent(component: AbstractComponent, context: CanvasRenderingContext2D, deltaTime: number): false | void {
        component.Draw(context, deltaTime);

        for (const child of component.ReverseComponents()) {
            this.drawComponent(child, context, deltaTime);
        }
    }
}

export default Renderer;