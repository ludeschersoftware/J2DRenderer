import TickTock from "@ludeschersoftware/ticktock";
import { createElement } from "@ludeschersoftware/dom";
import RendererEventType from "./Enum/RendererEventType";
import AbstractComponent from "./Abstract/AbstractComponent";
import { Mat3, Vec2 } from "gl-matrix";
import GlobalConfigInterface from "./Interfaces/GlobalConfigInterface";
import CanvasInterface from "./Interfaces/CanvasInterface";
import InitConfigInterface from "./Interfaces/InitConfigInterface";
import { initializeConfig, setConfig } from "./Config";
import EventHub from "./EventHub";
import LogLog from "./Logger";
import SceneManager from "./Manager/SceneManager";
import AbstractScene from "./Abstract/AbstractScene";
import InputManager from "./Manager/InputManager";

class Renderer {
    private m_config: GlobalConfigInterface;
    private m_scene_manager: SceneManager;
    private m_now: number;
    private m_canvas_stack: Map<number, CanvasInterface>;
    private m_event_layer_element: HTMLDivElement;
    private m_input_manager: InputManager;
    private m_resize_ticktock: TickTock;

    constructor(config: InitConfigInterface) {
        initializeConfig();

        const { Container, Id, Logger, ...rest } = config;
        const CONTAINER_RECT: DOMRect = Container.getBoundingClientRect();

        //  Camera: new Canvas2DCamera(new Vec2(Container.clientWidth, Container.clientHeight)),

        this.m_config = Object.assign({
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
        }, rest);
        this.m_scene_manager = new SceneManager(this.m_config);
        this.m_now = 0;
        this.m_canvas_stack = new Map();
        this.m_input_manager = new InputManager();

        setConfig(Id, this.m_config);

        this.m_event_layer_element = createElement('div', {
            className: 'event-layer',
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: `${Container.offsetWidth}px`,
                height: `${Container.offsetHeight}px`,
                zIndex: '6',
                cursor: 'none',
            },
        });

        Container.appendChild(this.m_event_layer_element);

        document.addEventListener('contextmenu', e => e?.cancelable && e.preventDefault());

        this.m_event_layer_element.addEventListener("mousedown", (e) => this.canvasMouseDown(e));
        this.m_event_layer_element.addEventListener("mouseup", (e) => this.canvasMouseUp(e));
        this.m_event_layer_element.addEventListener("mousemove", (e) => this.canvasMouseMove(e));

        document.body.addEventListener("keydown", (e) => this.canvasKeyDown(e));
        document.body.addEventListener("keyup", (e) => this.canvasKeyUp(e));

        this.m_resize_ticktock = new TickTock(this.handleResize, 500);

        (new ResizeObserver(() => {
            this.m_resize_ticktock.run();
        })).observe(Container);

        this.handleResize();
    }

    public SetLoadingScene = (scene: AbstractScene): void => this.m_scene_manager.SetLoadingScene(scene);
    public RegisterScene = (scene: AbstractScene): void => this.m_scene_manager.RegisterScene(scene);
    public IsSceneRegistered = (scene_id: string): boolean => this.m_scene_manager.IsSceneRegistered(scene_id);

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

        if (this.m_scene_manager.activeScene!.Layers.length !== this.m_canvas_stack.length) {
            this.updateCanvasStack();
        }

        /**
         * Update all Components in reverse order
         */

        this.m_input_state.MousePositionWorld.x = 0;
        this.m_input_state.MousePositionWorld.y = 0;

        if (this.m_config.Camera !== undefined) {
            Vec2.copy(this.m_input_state.MousePositionWorld, this.m_config.Camera!.ViewportToWorld(this.m_input_state.MousePositionCamera));
        }

        let tmp_index: number = this.m_scene_manager.activeScene!.Layers.length - 1;

        for (let x = 0; x < this.m_scene_manager.activeScene!.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = this.m_scene_manager.activeScene!.Layers[tmp_index].components;

            let tmp_inner_index: number = COMPONENTS.length - 1;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.updateComponent(COMPONENTS[tmp_inner_index], DELTA_TIME, this.m_input_state);

                tmp_inner_index--;
            }

            tmp_index--;
        }

        /**
         * Draw all Components
         */

        this.clearContext2ds(); // TODO => only call .clearContext2ds() if the first .drawComponent() returns void|undefined => otherwise we "cache" the rendered context.

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

        for (let x = 0; x < this.m_scene_manager.activeScene!.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = this.m_scene_manager.activeScene!.Layers[x].components;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.drawComponent(COMPONENTS[y], this.m_canvas_stack[x]!.Context2d, DELTA_TIME);
            }
        }

        if (this.m_scene_manager.moveToNextScene()) {
            this.m_input_state.MouseLeftDown = false;
            this.m_input_state.MouseMiddleDown = false;
            this.m_input_state.MouseRightDown = false;
            this.m_input_state.KeyboardKeyDown = {};
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

    private canvasMouseDown(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();

        if (e.which === 1 || e.button === 0) {
            this.m_input_state.MouseLeftDown = true;
        }

        if (e.which === 2 || e.button === 1) {
            this.m_input_state.MouseMiddleDown = true;
        }

        if (e.which === 3 || e.button === 2) {
            this.m_input_state.MouseRightDown = true;
        }

        // if (e.which === 4 || e.button === 3) {
        //     console.log('"Back" at ' + e.clientX + 'x' + e.clientY);
        // }

        // if (e.which === 5 || e.button === 4) {
        //     console.log('"Forward" at ' + e.clientX + 'x' + e.clientY);
        // }
    }

    private canvasMouseUp(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();

        if (e.which === 1 || e.button === 0) {
            this.m_input_state.MouseLeftDown = false;
        }

        if (e.which === 2 || e.button === 1) {
            this.m_input_state.MouseMiddleDown = false;
        }

        if (e.which === 3 || e.button === 2) {
            this.m_input_state.MouseRightDown = false;
        }

        // if (e.which === 4 || e.button === 3) {
        //     console.log('"Back" at ' + e.clientX + 'x' + e.clientY);
        // }

        // if (e.which === 5 || e.button === 4) {
        //     console.log('"Forward" at ' + e.clientX + 'x' + e.clientY);
        // }
    }

    private canvasMouseMove(e: MouseEvent): void {
        e.preventDefault();
        e.stopPropagation();

        this.m_input_state.MousePositionCamera.x = ((e.clientX - this.m_config.Canvas.x) * this.m_config.Scale);
        this.m_input_state.MousePositionCamera.y = ((e.clientY - this.m_config.Canvas.y) * this.m_config.Scale);
    }

    private canvasKeyDown(e: KeyboardEvent): void {
        this.m_input_state.KeyboardKeyDown[e.code] = true;
    }

    private canvasKeyUp(e: KeyboardEvent): void {
        delete this.m_input_state.KeyboardKeyDown[e.code];
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
        if (component.Update(deltaTime, inputState) === false) {
            return false;
        }

        const COMPONENT_CHILDREN: AbstractComponent[] = component.GetComponents();

        let tmp_index: number = COMPONENT_CHILDREN.length - 1;

        for (let z = 0; z < COMPONENT_CHILDREN.length; z++) {
            if (this.updateComponent(COMPONENT_CHILDREN[tmp_index], deltaTime, inputState) === false) {
                return false;
            }

            tmp_index--;
        }
    }

    private drawComponent(component: AbstractComponent, context: CanvasRenderingContext2D, deltaTime: number): false | void {
        if (component.Draw(context, deltaTime) === false) {
            return false;
        }

        const COMPONENT_CHILDREN: AbstractComponent[] = component.GetComponents();

        for (let z = 0; z < COMPONENT_CHILDREN.length; z++) {
            if (this.drawComponent(COMPONENT_CHILDREN[z], context, deltaTime) === false) {
                return false;
            }
        }
    }

    private handleResize = (): void => {
        this.m_config.EventHub.send(RendererEventType.BeforeResizeReInitialization, this.m_scene_manager.activeScene?.Id);

        const CONTAINER_RECT: DOMRect = this.m_config.Container.getBoundingClientRect();

        this.m_config.Canvas.width = this.m_config.Container.offsetWidth;
        this.m_config.Canvas.height = this.m_config.Container.offsetHeight;
        this.m_config.Canvas.x = CONTAINER_RECT.x;
        this.m_config.Canvas.y = CONTAINER_RECT.y;
        this.m_config.Scale = 1;

        this.m_event_layer_element!.style.width = `${this.m_config.Container.offsetWidth}px`;
        this.m_event_layer_element!.style.height = `${this.m_config.Container.offsetHeight}px`;

        if (this.m_config.Camera !== undefined) {
            this.m_config.Camera!.ResizeCanvas(new Vec2(this.m_config.Container.clientWidth, this.m_config.Container.clientHeight));
        }

        this.optimizeCanvas();

        this.m_config.EventHub.send(RendererEventType.AfterResizeReInitialization, this.m_scene_manager.activeScene?.Id);
    };
}

export default Renderer;