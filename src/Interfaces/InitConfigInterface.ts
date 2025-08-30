import AbstractScene from "../Abstract/AbstractScene";
import TLoggerCallback from "../Types/TLoggerCallback";
import BaseConfigInterface from "./BaseConfigInterface";

interface InitConfigInterface extends BaseConfigInterface {
    Container: HTMLDivElement;
    ShowLoadingScene?: boolean;
    LoadingScene?: AbstractScene;
    Scenes?: Array<AbstractScene>;
    logger?: TLoggerCallback;
}

export default InitConfigInterface;