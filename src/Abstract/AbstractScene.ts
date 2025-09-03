import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";
import SceneLayer from "../SceneLayer";

abstract class AbstractScene {
    public Id: string;

    protected m_config!: GlobalConfigInterface;
    protected m_layers: Map<number, SceneLayer>;

    constructor(id: string) {
        this.Id = id;
        this.m_layers = new Map();
    }

    public Initialize(config: GlobalConfigInterface): void {
        this.m_config = config;
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