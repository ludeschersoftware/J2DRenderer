import { Vec2 } from "gl-matrix";

class MouseState {
    private m_position_camera: Vec2;
    private m_position_world: Vec2;
    private m_left_down: boolean;
    private m_middle_down: boolean;
    private m_right_down: boolean;

    public constructor() {
        this.m_position_camera = Vec2.create();
        this.m_position_world = Vec2.create();
        this.m_left_down = false;
        this.m_middle_down = false;
        this.m_right_down = false;
    }

    public get PositionCamera(): Vec2 {
        return this.m_position_camera;
    }

    public get PositionWorld(): Vec2 {
        return this.m_position_world;
    }

    public get LeftDown(): boolean {
        return this.m_left_down;
    }

    public get MiddleDown(): boolean {
        return this.m_middle_down;
    }

    public get RightDown(): boolean {
        return this.m_right_down;
    }
}

export default MouseState;