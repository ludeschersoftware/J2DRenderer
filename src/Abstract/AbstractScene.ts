import CameraInterface from "../Interfaces/CameraInterface";
import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";
import SceneLayer from "../SceneLayer";

abstract class AbstractScene {
    public m_id: string;

    protected m_config!: GlobalConfigInterface;
    protected m_camera!: CameraInterface;
    protected m_layers: Map<number, SceneLayer>;

    constructor(id: string) {
        this.m_id = id;
        this.m_layers = new Map();
    }

    public get Id(): string {
        return this.m_id;
    }

    public Initialize(config: GlobalConfigInterface, camera: CameraInterface): void {
        this.m_config = config;
        this.m_camera = camera;
        this.m_layers.clear();
    }

    public *Layers(): Generator<SceneLayer> {
        for (const layer of this.m_layers.values()) {
            yield layer;
        }
    }

    protected AddLayer(layer: SceneLayer): void {
        this.m_layers.set(this.m_layers.size, layer);
    }
}

export default AbstractScene;