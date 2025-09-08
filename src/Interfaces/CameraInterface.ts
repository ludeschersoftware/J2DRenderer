import { Mat3, Vec2 } from "gl-matrix";

interface CameraInterface {
    set Position(value: Vec2);
    get Position(): Vec2;
    set Rotation(value: number);
    get Rotation(): number;
    set Zoom(value: number);
    get Zoom(): number;
    MovePosition(value: Vec2): void;
    ResizeCanvas(newSize: Vec2): void;
    GetViewProjectionMatrix(): Mat3;
    ViewportToWorld(viewportPoint: Vec2): Vec2;
}

export default CameraInterface;