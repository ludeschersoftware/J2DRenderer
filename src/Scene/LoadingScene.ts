import AbstractScene from "../Abstract/AbstractScene";

class LoadingScene extends AbstractScene {
    public static GetId(): string {
        return "default-loading-scene";
    }

    constructor() {
        super(LoadingScene.GetId());
    }
}

export default LoadingScene;