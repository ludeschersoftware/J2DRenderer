import List from "@ludeschersoftware/list";
import CameraInterface from "../Interfaces/CameraInterface";
import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";
import SceneLayer from "../SceneLayer";

abstract class AbstractScene {
    public m_id: string;

    protected m_config!: GlobalConfigInterface;
    protected m_camera!: CameraInterface;
    protected m_layers: List<SceneLayer>;

    constructor(id: string) {
        this.m_id = id;
        this.m_layers = new List();
    }

    public get Id(): string {
        return this.m_id;
    }

    public Initialize(config: GlobalConfigInterface, camera: CameraInterface): void {
        this.m_config = config;
        this.m_camera = camera;
        this.m_layers.Clear();
    }

    public *Layers(): Generator<SceneLayer> {
        yield* this.m_layers;
    }

    protected AddLayer(layer: SceneLayer): void {
        this.m_layers.Add(layer);
    }
}

export default AbstractScene;