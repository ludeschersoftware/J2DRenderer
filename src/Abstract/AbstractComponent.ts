import { Box, Optional } from "@ludeschersoftware/types";
import InputStateInterface from "../Interfaces/InputStateInterface";
import ContentManager from "../Manager/ContentManager";

abstract class AbstractComponent implements Box {
    private m_box: Box;
    private m_parent_component: AbstractComponent | undefined;
    private m_child_components: AbstractComponent[];

    constructor(box?: Optional<Box>) {
        this.m_box = Object.assign({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }, box);
        this.m_parent_component = undefined;
        this.m_child_components = [];
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

    public SetParentComponent(parent: AbstractComponent): void {
        this.m_parent_component = parent;
    }

    public Initialize(): void { }
    public LoadContent(_contentManager: ContentManager): void { }
    public Update(_deltaTime: number, _inputState: InputStateInterface): void | false { }
    public Draw(_context: CanvasRenderingContext2D, _deltaTime: number): void | false { }

    public GetComponents(): AbstractComponent[] {
        return this.m_child_components;
    }

    protected addComponent(component: AbstractComponent): void {
        component.SetParentComponent(this);

        this.m_child_components.push(component);
    }
}

export default AbstractComponent;