import AbstractScene from "../Abstract/AbstractScene";

class LoadingScene extends AbstractScene {
    public static GET_ID(): string {
        return "default-loading-scene";
    }

    constructor() {
        super(LoadingScene.GET_ID());
    }
}

export default LoadingScene;