import BackendType from "./Enum/BackendType";
import AbstractComponent from "./Abstract/AbstractComponent";
import WebGLBackend from "./WebGLBackend";
import Canvas2DBackend from "./Canvas2DBackend";
import ContextInterface from "./Interfaces/ContextInterface";

class SceneLayer {
    protected m_backend: ContextInterface;
    protected m_components: Array<AbstractComponent>;
    protected m_fixed_camera: boolean;

    constructor(backend?: BackendType, fixedCamera?: boolean) {
        this.m_backend = (backend === BackendType.WebGL) ? new WebGLBackend() : new Canvas2DBackend();
        this.m_components = [];
        this.m_fixed_camera = fixedCamera ?? false;
    }

    public *Components(): Generator<AbstractComponent> {
        for (const component of this.m_components) {
            yield component;
        }
    }

    public Draw(): void {
        for (const component of this.m_components) {
            component.Draw(this.m_backend, 0);
        }
    }
}

export default SceneLayer;