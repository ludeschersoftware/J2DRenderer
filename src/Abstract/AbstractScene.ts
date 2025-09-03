import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";
import TSceneLayers from "../Types/TSceneLayers";

abstract class AbstractScene {
    public Id: string;
    public Layers: TSceneLayers;

    protected m_config!: GlobalConfigInterface;

    constructor(id: string) {
        this.Id = id;
        this.Layers = [];
    }

    public Initialize(config: GlobalConfigInterface): void {
        this.Layers = [];
        this.m_config = config;
    }
}

export default AbstractScene;