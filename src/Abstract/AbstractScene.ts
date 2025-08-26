import Camera2D from "../Camera2D";
import TSceneLayers from "../Types/TSceneLayers";

abstract class AbstractScene {
    public Id: string;
    public Camera: Camera2D | undefined;
    public Layers: TSceneLayers;

    constructor(id: string, camera?: Camera2D) {
        this.Id = id;
        this.Camera = camera;
        this.Layers = [];
    }

    public Initialize(): void {
        this.Layers = [];
    }
}

export default AbstractScene;