import TickTock from "@ludeschersoftware/ticktock";
import RendererEventType from "./Enum/RendererEventType";
import GlobalConfigInterface from "./Interfaces/GlobalConfigInterface";
import { Vec2 } from "gl-matrix";

class BlankWindow {
    protected readonly m_config: GlobalConfigInterface;
    protected m_resize_ticktock: TickTock;

    public constructor(container: HTMLDivElement, config: GlobalConfigInterface) {
        this.m_config = config;
        this.m_resize_ticktock = new TickTock(() => this.handleResize(), 500);

        (new ResizeObserver(() => {
            this.m_resize_ticktock.run();
        })).observe(container);

        this.handleResize();
    }

    private handleResize(): void {
        this.m_config.EventHub.send(RendererEventType.BeforeResizeReInitialization, this.m_scene_manager.activeScene?.Id);

        const CONTAINER_RECT: DOMRect = this.m_config.Container.getBoundingClientRect();

        this.m_config.Viewport.width = this.m_config.Container.offsetWidth;
        this.m_config.Viewport.height = this.m_config.Container.offsetHeight;
        this.m_config.Viewport.x = CONTAINER_RECT.x;
        this.m_config.Viewport.y = CONTAINER_RECT.y;
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

export default BlankWindow;