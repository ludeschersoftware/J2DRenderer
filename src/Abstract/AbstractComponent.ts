import { Box, Optional, Size, Vector2 } from "@ludeschersoftware/types";
import ContentManager from "../Manager/ContentManager";
import ContextInterface from "../Interfaces/ContextInterface";
import RenderTime from "../RenderTime";
import InputManager from "../Manager/InputManager";

abstract class AbstractComponent implements Box {
    private m_box: Box;
    private m_parent_component: AbstractComponent | undefined;
    private m_child_components: Map<number, AbstractComponent>;

    constructor(box?: Optional<Box>) {
        this.m_box = Object.assign({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }, box);
        this.m_parent_component = undefined;
        this.m_child_components = new Map();
    }

    public get x(): number {
        if (this.m_parent_component === undefined) {
            return this.m_box.x;
        }

        return this.m_box.x + this.m_parent_component.x;
    }

    public set x(x: number) {
        this.m_box.x = x;
    }

    public get y(): number {
        if (this.m_parent_component === undefined) {
            return this.m_box.y;
        }

        return this.m_box.y + this.m_parent_component.y;
    }

    public set y(y: number) {
        this.m_box.y = y;
    }

    public get width(): number {
        return this.m_box.width;
    }

    public set width(width: number) {
        this.m_box.width = width;
    }

    public get height(): number {
        return this.m_box.height;
    }

    public set height(height: number) {
        this.m_box.height = height;
    }

    public get position(): Vector2 {
        return { x: this.x, y: this.y };
    }

    public get size(): Size {
        return { width: this.width, height: this.height };
    }

    public SetParentComponent(parent: AbstractComponent): void {
        this.m_parent_component = parent;
    }

    public Initialize(): void { }
    public LoadContent(_contentManager: ContentManager): void { }
    public Update(_renderTime: RenderTime, _inputManager: InputManager): void { }
    public Draw(_context: ContextInterface, _renderTime: RenderTime): void { }

    public *Components(): Generator<AbstractComponent> {
        for (const component of this.m_child_components.values()) {
            yield component;
        }
    }

    protected addComponent(component: AbstractComponent): void {
        component.SetParentComponent(this);

        this.m_child_components.set(this.m_child_components.size, component);
    }

    protected getParentComponent(): AbstractComponent | undefined {
        return this.m_parent_component;
    }
}

export default AbstractComponent;