import { Vec2 } from "gl-matrix";

interface InputStateInterface {
    MousePositionCamera: Vec2;
    MousePositionWorld: Vec2;
    MouseLeftDown: boolean;
    MouseMiddleDown: boolean;
    MouseRightDown: boolean;
    KeyboardKeyDown: { [key: string]: boolean; };
}

export default InputStateInterface;