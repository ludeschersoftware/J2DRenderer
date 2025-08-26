import AbstractScene from "../Abstract/AbstractScene";
import BaseConfigInterface from "./BaseConfigInterface";

interface InitConfigInterface extends BaseConfigInterface {
    Container: HTMLDivElement;
    ShowLoadingScene?: boolean;
    LoadingScene?: AbstractScene;
    Scenes?: Array<AbstractScene>;
}

export default InitConfigInterface;