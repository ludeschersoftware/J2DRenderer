import GlobalConfigInterface from "../Interfaces/GlobalConfigInterface";

export declare const CONFIG_KEY: unique symbol;
export declare type CONFIG_STORE = Map<string, GlobalConfigInterface>;

declare global {
    interface GlobalThis {
        [CONFIG_KEY]: CONFIG_STORE;
    }
}
