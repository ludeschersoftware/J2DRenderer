import KeyboardState from "../KeyboardState";
import MouseState from "../MouseState";

class InputManager {
    private m_mouse_state: MouseState;
    private m_keyboard_state: KeyboardState;

    public constructor() {
        this.m_mouse_state = new MouseState();
        this.m_keyboard_state = new KeyboardState();
    }

    public get Mouse(): MouseState {
        return this.m_mouse_state;
    }

    public get Keyboard(): KeyboardState {
        return this.m_keyboard_state;
    }

    public Update(): void {
        this.m_mouse_state.LeftDown;
        this.m_keyboard_state.IsKeyDown("");
    }
}

export default InputManager;