import AbstractScene from "../Abstract/AbstractScene";

class LoadingScene extends AbstractScene {
    public static GetId(): string {
        return "tsgame-loading-scene";
    }

    public override Initialize(): void {
        super.Initialize();

        this.Layers = [];
    }
}

export default LoadingScene;