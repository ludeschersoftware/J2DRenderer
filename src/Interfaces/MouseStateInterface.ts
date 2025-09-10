import { Vec2 } from "gl-matrix";

interface MouseStateInterface {
    readonly PositionCamera: Vec2;
    readonly PositionWorld: Vec2;
    readonly LeftDown: boolean;
    readonly MiddleDown: boolean;
    readonly RightDown: boolean;
}

export default MouseStateInterface;