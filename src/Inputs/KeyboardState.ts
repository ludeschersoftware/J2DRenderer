import KeyboardMutatorInterface from "./types/KeyboardMutatorInterface";
import KeyboardStateInterface from "./types/KeyboardStateInterface";

class KeyboardState implements KeyboardStateInterface, KeyboardMutatorInterface {
    private m_pressed_keys: Map<string, boolean>;

    public constructor() {
        this.m_pressed_keys = new Map();
    }

    public IsKeyDown(key: string): boolean {
        return this.m_pressed_keys.has(key);
    }

    public SetKeyDown(key: string): void {
        this.m_pressed_keys.set(key, true);
    }

    public UnsetKeyDown(key: string): void {
        this.m_pressed_keys.delete(key);
    }
}

export default KeyboardState;