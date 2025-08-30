import CEventType from "./Enum/CEventType";

class SceneEvent<T> extends CustomEvent<T | undefined> {
    constructor(type: CEventType, payload?: T) {
        super(type, { detail: payload });
    }

}

export default SceneEvent;