import BackendType from "./Enum/BackendType";
import AbstractComponent from "./Abstract/AbstractComponent";
import WebGLBackend from "./WebGLBackend";
import Canvas2DBackend from "./Canvas2DBackend";
import ContextInterface from "./Interfaces/ContextInterface";

class SceneLayer {
    private m_backend: ContextInterface;
    private m_components: Map<number, AbstractComponent>;
    private m_fixed_camera: boolean;

    constructor(backend?: BackendType, fixedCamera?: boolean) {
        this.m_backend = (backend === BackendType.WebGL) ? new WebGLBackend() : new Canvas2DBackend();
        this.m_components = new Map();
        this.m_fixed_camera = fixedCamera ?? false;
    }

    public *Components(): Generator<AbstractComponent> {
        for (const component of this.m_components.values()) {
            yield component;
        }
    }

    public Draw(): void {
        for (const component of this.m_components.values()) {
            component.Draw(this.m_backend, 0);
        }
    }
}

export default SceneLayer;