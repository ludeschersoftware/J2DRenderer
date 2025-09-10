import { appendElement } from "@ludeschersoftware/dom";
import StateWithMutator from "../StateWithMutator";
import MouseStateInterface from "../Interfaces/MouseStateInterface";
import MouseState from "../MouseState";
import KeyboardStateInterface from "../Interfaces/KeyboardStateInterface";
import KeyboardState from "../KeyboardState";
import { KeyboardMutator, MouseMutator } from "../InternalSymbols";
import MouseMutatorInterface from "../Interfaces/MouseMutatorInterface";
import KeyboardMutatorInterface from "../Interfaces/KeyboardMutatorInterface";
import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";

class InputManager {
    protected readonly m_config: GlobalConfigInterface;
    protected readonly m_mouse: StateWithMutator<MouseStateInterface, MouseState>;
    protected readonly m_mouse_mutator: MouseMutatorInterface;
    protected readonly m_keyboard: StateWithMutator<KeyboardStateInterface, KeyboardState>;
    protected readonly m_keyboard_mutator: KeyboardMutatorInterface;
    protected readonly m_event_layer: HTMLDivElement;

    constructor(container: HTMLDivElement, config: GlobalConfigInterface) {
        this.m_config = config;
        this.m_mouse = new StateWithMutator(new MouseState(), MouseMutator);
        this.m_mouse_mutator = this.m_mouse.getMutator(MouseMutator)!;
        this.m_keyboard = new StateWithMutator(new KeyboardState(), KeyboardMutator);
        this.m_keyboard_mutator = this.m_keyboard.getMutator(KeyboardMutator)!;
        this.m_event_layer = appendElement(container, 'div', {
            className: 'event-layer',
            style: {
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: `${container.offsetWidth}px`,
                height: `${container.offsetHeight}px`,
                zIndex: '6',
                cursor: 'none',
            },
            onmousedown: this.canvasMouseDown,
            onmouseup: this.canvasMouseUp,
            onmousemove: this.canvasMouseMove,
        });

        document.body.addEventListener("keydown", (e) => this.canvasKeyDown(e));
        document.body.addEventListener("keyup", (e) => this.canvasKeyUp(e));
    }

    public get Mouse(): MouseStateInterface {
        return this.m_mouse.public;
    }

    public get Keyboard(): KeyboardStateInterface {
        return this.m_keyboard.public;
    }

    private canvasMouseDown = (e: MouseEvent): void => {
        if (e.button === 0) {
            this.m_mouse_mutator.SetLeftDown(true);
        }

        if (e.button === 1) {
            this.m_mouse_mutator.SetMiddleDown(true);
        }

        if (e.button === 2) {
            this.m_mouse_mutator.SetRightDown(true);
        }
    };

    private canvasMouseUp = (e: MouseEvent): void => {
        if (e.button === 0) {
            this.m_mouse_mutator.SetLeftDown(false);
        }

        if (e.button === 1) {
            this.m_mouse_mutator.SetMiddleDown(false);
        }

        if (e.button === 2) {
            this.m_mouse_mutator.SetRightDown(false);
        }
    };

    private canvasMouseMove = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();

        this.m_mouse_mutator.SetCameraX((e.clientX - this.m_config.Viewport.x) * this.m_config.Scale);
        this.m_mouse_mutator.SetCameraY((e.clientY - this.m_config.Viewport.y) * this.m_config.Scale);
    };

    private canvasKeyDown = (e: KeyboardEvent): void => {
        this.m_keyboard_mutator.SetKeyDown(e.code);
    };

    private canvasKeyUp = (e: KeyboardEvent): void => {
        this.m_keyboard_mutator.UnsetKeyDown(e.code);
    };
}

export default InputManager;