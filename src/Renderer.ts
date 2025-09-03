import TickTock from "@ludeschersoftware/ticktock";
import { createElement } from "@ludeschersoftware/dom";
import CEventType from "./Enum/CEventType";
import LoadingScene from "./Scene/LoadingScene";
import { ResolveAsync } from "./Utils/PromiseHelper";
import AbstractComponent from "./Abstract/AbstractComponent";
import ContentManager from "./Manager/ContentManager";
import AbstractScene from "./Abstract/AbstractScene";
import { Mat3, Vec2 } from "gl-matrix";
import InputStateInterface from "./Interfaces/InputStateInterface";
import GlobalConfigInterface from "./Interfaces/GlobalConfigInterface";
import CanvasInterface from "./Interfaces/CanvasInterface";
import InitConfigInterface from "./Interfaces/InitConfigInterface";
import { initializeConfig, setConfig } from "./Config";
import EventHub from "./EventHub";
import Logger from "./Logger";
import Camera2D from "./Camera2D";

class Renderer {
    private m_config: GlobalConfigInterface;
    private m_scenes: Map<string, AbstractScene>;
    private m_now: number;
    private m_active_scene: AbstractScene | undefined;
    private m_loading_scene_promise: Promise<AbstractScene> | undefined;
    private m_loading_scene: AbstractScene | undefined;
    private m_next_scene: AbstractScene | undefined;
    private m_currently_initializing_scene_id: string | undefined;
    private m_canvas_stack: Array<CanvasInterface>;
    private m_event_layer_element: HTMLDivElement;
    private m_input_state: InputStateInterface;
    private m_resize_ticktock: TickTock;

    constructor(config: InitConfigInterface) {
        initializeConfig();

        this.m_scenes = new Map();
        this.m_now = 0;
        this.m_active_scene = undefined;
        this.m_loading_scene_promise = undefined;
        this.m_loading_scene = undefined;
        this.m_next_scene = undefined;
        this.m_currently_initializing_scene_id = undefined;
        this.m_canvas_stack = [];
        this.m_input_state = {
            MousePositionCamera: Vec2.create(),
            MousePositionWorld: Vec2.create(),
            MouseLeftDown: false,
            MouseMiddleDown: false,
            MouseRightDown: false,
            KeyboardKeyDown: {},
        };

        const CONTAINER_RECT: DOMRect = config.Container.getBoundingClientRect();

        const { logger, ...rest } = config;

        this.m_config = Object.assign({
            Canvas: {
                width: config.Container.offsetWidth,
                height: config.Container.offsetHeight,
                x: CONTAINER_RECT.x,
                y: CONTAINER_RECT.y,
            },
            Scale: 1,
            EventHub: new EventHub(config.Container),
            Logger: new Logger(logger),
            Camera: new Camera2D(new Vec2(config.Container.clientWidth, config.Container.clientHeight)),
        }, rest);

        setConfig(config.Id, this.m_config);

        this.m_loading_scene_promise = this.initializeSceneAsync(new LoadingScene());
        this.m_event_layer_element = createElement('div', {
            className: 'event-layer',
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: `${config.Container.offsetWidth}px`,
                height: `${config.Container.offsetHeight}px`,
                zIndex: '6',
                cursor: 'none',
            },
        });

        config.Container.appendChild(this.m_event_layer_element);

        document.addEventListener('contextmenu', e => e?.cancelable && e.preventDefault());

        this.m_config.EventHub.listen(CEventType.LoadScene, this.handleLoadScene);

        this.m_event_layer_element.addEventListener("mousedown", (e) => this.canvasMouseDown(e));
        this.m_event_layer_element.addEventListener("mouseup", (e) => this.canvasMouseUp(e));
        this.m_event_layer_element.addEventListener("mousemove", (e) => this.canvasMouseMove(e));

        document.body.addEventListener("keydown", (e) => this.canvasKeyDown(e));
        document.body.addEventListener("keyup", (e) => this.canvasKeyUp(e));

        this.m_resize_ticktock = new TickTock(this.handleResize, 500);

        (new ResizeObserver(() => {
            this.m_resize_ticktock.run();
        })).observe(config.Container);

        this.handleResize();
    }

    public SetLoadingScene(scene: AbstractScene): void {
        this.m_loading_scene_promise = this.initializeSceneAsync(scene);
    }

    public RegisterScene(scene: AbstractScene): void {
        if (this.m_scenes.has(scene.Id) === true) {
            throw new Error(`There is already a scene registered with the given id "${scene.Id}"!`);
        }

        this.m_scenes.set(scene.Id, scene);
    }

    public LoadScene(scene_id: string): void {
        if (scene_id === LoadingScene.GetId()) {
            this.m_next_scene = this.m_loading_scene;
        } else if (this.m_scenes.has(scene_id) === false) {
            throw new Error(`There is no scene registered with the given id "${scene_id}"!`);
        } else if (this.m_currently_initializing_scene_id !== scene_id) {
            this.m_next_scene = this.m_loading_scene;
            this.m_currently_initializing_scene_id = scene_id;

            this.initializeSceneAsync(this.m_scenes.get(scene_id)!)
                .then((scene: AbstractScene) => {
                    this.m_next_scene = scene;
                    this.m_currently_initializing_scene_id = undefined;
                })
                .catch((e: any) => {
                    this.m_config.Logger.error(e);
                });
        }
    }

    public async RunAsync(scene_id: string): Promise<void> {
        this.clearContext2ds();

        const LOADING_SCENE: any[] | (AbstractScene | null)[] = await ResolveAsync<AbstractScene>(this.m_loading_scene_promise!);

        if (LOADING_SCENE[0] === null) {
            this.m_config.Logger.error(LOADING_SCENE[1]);
            throw new Error(`An unexpected error occurred during "loading-scene" initialization. Please consult the log for details and resolve the issue.`);
        }

        this.m_loading_scene = LOADING_SCENE[0];

        this.LoadScene(scene_id);

        if (this.m_active_scene === undefined) {
            this.m_active_scene = this.m_loading_scene;
        }

        requestAnimationFrame(this.renderLoop);
    }

    private renderLoop = (now: number) => {
        now *= 0.001;

        const DELTA_TIME: number = now - this.m_now;

        this.m_now = now;

        if (this.m_active_scene!.Layers.length !== this.m_canvas_stack.length) {
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

        let tmp_index: number = this.m_active_scene!.Layers.length - 1;

        for (let x = 0; x < this.m_active_scene!.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = this.m_active_scene!.Layers[tmp_index].components;

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
            for (let x = 0; x < this.m_active_scene!.Layers.length; x++) {
                const APPLY_CAMERA: boolean = this.m_active_scene!.Layers[x].applyCamera;

                if (APPLY_CAMERA === false) {
                    continue;
                }

                const CANVAS: CanvasInterface = this.m_canvas_stack[x];
                const CANVAS_TRANSFORM: Mat3 = this.m_config.Camera.GetViewProjectionMatrix();

                CANVAS.Context2d!.setTransform(CANVAS_TRANSFORM[0], CANVAS_TRANSFORM[1], CANVAS_TRANSFORM[3], CANVAS_TRANSFORM[4], CANVAS_TRANSFORM[6], CANVAS_TRANSFORM[7]);
            }
        }

        for (let x = 0; x < this.m_active_scene!.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = this.m_active_scene!.Layers[x].components;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.drawComponent(COMPONENTS[y], this.m_canvas_stack[x]!.Context2d, DELTA_TIME);
            }
        }

        if (this.m_next_scene !== undefined) {
            /**
             * Make sure you switch scenes only after the current render loop,
             * otherwise you would change resources update and draw calls for the active scene
             * which could lead to crashes.
             */
            this.m_active_scene = this.m_next_scene;
            this.m_next_scene = undefined;
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

    private async initializeSceneAsync(scene: AbstractScene): Promise<AbstractScene> {
        scene.Initialize(this.m_config);

        /**
         * Initialize all Components
         */

        for (let x = 0; x < scene.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = scene.Layers[x].components;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.initializeComponent(COMPONENTS[y]);
            }
        }

        /**
         * Load all Component Contents
         */

        const CONTENT_MANAGER: ContentManager = new ContentManager();

        for (let x = 0; x < scene.Layers.length; x++) {
            const COMPONENTS: AbstractComponent[] = scene.Layers[x].components;

            for (let y = 0; y < COMPONENTS.length; y++) {
                this.loadContentComponent(CONTENT_MANAGER, COMPONENTS[y]);
            }
        }

        const CONTENT_RESULT: PromiseSettledResult<void>[] = await CONTENT_MANAGER.WaitLoadFulfilledAsync();

        if (CONTENT_RESULT.filter(x => x.status === 'rejected').length > 0) {
            throw new Error(`Initialization failed for scene "${scene.Id}", one or more content elements could not be loaded!`);
        }

        return scene;
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
        if (this.m_active_scene!.Layers.length < this.m_canvas_stack.length) {
            const CANVAS_DIFF: number = this.m_canvas_stack.length - this.m_active_scene!.Layers.length;

            for (let x = 0; x < CANVAS_DIFF; x++) {
                this.m_canvas_stack.pop()!.Element.remove();
            }

            this.optimizeCanvas();

            return;
        }

        const CANVAS_DIFF: number = this.m_active_scene!.Layers.length - this.m_canvas_stack.length;

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

    private initializeComponent(component: AbstractComponent): void {
        component.Initialize();

        const COMPONENT_CHILDREN: AbstractComponent[] = component.GetComponents();

        for (let z = 0; z < COMPONENT_CHILDREN.length; z++) {
            this.initializeComponent(COMPONENT_CHILDREN[z]);
        }
    }

    private loadContentComponent(contentManager: ContentManager, component: AbstractComponent): void {
        component.LoadContent(contentManager);

        const COMPONENT_CHILDREN: AbstractComponent[] = component.GetComponents();

        for (let z = 0; z < COMPONENT_CHILDREN.length; z++) {
            this.loadContentComponent(contentManager, COMPONENT_CHILDREN[z]);
        }
    }

    private updateComponent(component: AbstractComponent, deltaTime: number, inputState: InputStateInterface): false | void {
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
        this.m_config.EventHub.send(CEventType.BeforeResizeReInitialization, this.m_active_scene?.Id);

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

        this.m_config.EventHub.send(CEventType.AfterResizeReInitialization, this.m_active_scene?.Id);
    };

    private handleLoadScene = (scene_id: string): void => {
        if (typeof scene_id === "string") {
            this.LoadScene(scene_id);
            return;
        }

        this.m_config.Logger.error(`The load scene event received an invalid scene ID. The ID must be a registered string.`);
    };
}

export default Renderer;