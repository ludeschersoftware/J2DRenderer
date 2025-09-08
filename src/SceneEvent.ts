import RendererEventType from "./Enum/RendererEventType";

class SceneEvent<T> extends CustomEvent<T | undefined> {
    constructor(type: RendererEventType, payload?: T) {
        super(type, { detail: payload });
    }

}

export default SceneEvent;