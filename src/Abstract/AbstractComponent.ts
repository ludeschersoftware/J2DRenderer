import { Box } from "@ludeschersoftware/types";
import InputStateInterface from "../Interfaces/InputStateInterface";
import ContentManager from "../Manager/ContentManager";

abstract class AbstractComponent implements Box {
    public width: number;
    public height: number;

    private m_x: number;
    private m_y: number;
    private m_parent_component: AbstractComponent | undefined;
    private m_child_components: AbstractComponent[];

    constructor(box: Box) {
        this.width = box.width;
        this.height = box.height;
        this.m_x = box.x;
        this.m_y = box.y;
        this.m_parent_component = undefined;
        this.m_child_components = [];
    }

    public get x(): number {
        if (this.m_parent_component === undefined) {
            return this.m_x;
        }

        return this.m_x + this.m_parent_component.x;
    }

    public set x(x: number) {
        this.m_x = x;
    }

    public get y(): number {
        if (this.m_parent_component === undefined) {
            return this.m_y;
        }

        return this.m_y + this.m_parent_component.y;
    }

    public set y(y: number) {
        this.m_y = y;
    }

    public SetParentComponent(parent: AbstractComponent): void {
        this.m_parent_component = parent;
    }

    public abstract Initialize(): void;
    public abstract LoadContent(contentManager: ContentManager): void;
    public abstract Update(deltaTime: number, inputState: InputStateInterface): void | false;
    public abstract Draw(context: CanvasRenderingContext2D, deltaTime: number): void | false;

    public GetComponents(): AbstractComponent[] {
        return this.m_child_components;
    }

    protected addComponent(component: AbstractComponent): void {
        component.SetParentComponent(this);

        this.m_child_components.push(component);
    }
}

export default AbstractComponent;