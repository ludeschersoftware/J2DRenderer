import InputStateInterface from "../Interfaces/InputStateInterface";
import RectangleInterface from "../Interfaces/RectangleInterface";
import ContentManager from "../Manager/ContentManager";

abstract class AbstractComponent implements RectangleInterface {
    public Width: number;
    public Height: number;

    private m_x: number;
    private m_y: number;
    private m_parent_component: AbstractComponent | undefined;
    private m_child_components: AbstractComponent[];

    constructor(rectangle: RectangleInterface) {
        this.Width = rectangle.Width;
        this.Height = rectangle.Height;
        this.m_x = rectangle.X;
        this.m_y = rectangle.Y;
        this.m_parent_component = undefined;
        this.m_child_components = [];
    }

    public get X(): number {
        if (this.m_parent_component === undefined) {
            return this.m_x;
        }

        return this.m_x + this.m_parent_component.X;
    }

    public set X(x: number) {
        this.m_x = x;
    }

    public get Y(): number {
        if (this.m_parent_component === undefined) {
            return this.m_y;
        }

        return this.m_y + this.m_parent_component.Y;
    }

    public set Y(y: number) {
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