import RendererEventType from "./Enum/RendererEventType";
import SceneEvent from "./SceneEvent";

class EventHub {
    private m_element: HTMLDivElement;

    public constructor(element: HTMLDivElement) {
        this.m_element = element;
    }

    public send<T>(type: RendererEventType, payload?: T): void {
        this.m_element.dispatchEvent(
            new SceneEvent<T>(type, payload)
        );
    }

    public listen<T>(type: RendererEventType, callback: (payload: T) => void): void {
        this.m_element.addEventListener(type, (ev: Event) => {
            callback((ev as SceneEvent<T>).detail!);
        });
    }
}

export default EventHub;