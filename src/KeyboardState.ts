class KeyboardState {
    private m_pressed_keys: Map<string, boolean>;

    public constructor() {
        this.m_pressed_keys = new Map();
    }

    public IsKeyDown(key: string): boolean {
        return this.m_pressed_keys.has(key);
    }
}

export default KeyboardState;