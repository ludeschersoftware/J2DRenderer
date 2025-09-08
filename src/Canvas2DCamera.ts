import { Mat3, Vec2 } from 'gl-matrix';
import CameraInterface from './Interfaces/CameraInterface';

class Canvas2DCamera implements CameraInterface {
    private m_position: Vec2;
    private m_rotation: number;
    private m_zoom: number;
    private m_view_matrix: Mat3;
    private m_projection_matrix: Mat3;
    private m_view_projection_matrix: Mat3;
    private m_inverse_view_projection_matrix: Mat3;
    private m_dirty: boolean;
    private m_canvas_size: Vec2;

    constructor(canvasSize: Vec2, zoom: number = 1) {
        this.m_position = Vec2.fromValues(0, 0);
        this.m_rotation = 0;
        this.m_zoom = zoom;
        this.m_view_matrix = Mat3.create();
        this.m_projection_matrix = Mat3.create();
        this.m_view_projection_matrix = Mat3.create();
        this.m_inverse_view_projection_matrix = Mat3.create();
        this.m_dirty = true;
        this.m_canvas_size = canvasSize;

        this.updateProjectionMatrix();
    }

    public set Position(value: Vec2) {
        Vec2.copy(this.m_position, value);

        this.m_dirty = true;
    }

    public get Position(): Vec2 {
        return this.m_position;
    }

    public set Rotation(value: number) {
        this.m_rotation = value;
        this.m_dirty = true;
    }

    public get Rotation(): number {
        return this.m_rotation;
    }

    public set Zoom(value: number) {
        this.m_zoom = value;
        this.m_dirty = true;
    }

    public get Zoom(): number {
        return this.m_zoom;
    }

    public MovePosition(value: Vec2): void {
        this.m_position.x += value.x;
        this.m_position.y += value.y;

        this.m_dirty = true;
    }

    public ResizeCanvas(newSize: Vec2): void {
        Vec2.copy(this.m_canvas_size, newSize);

        this.updateProjectionMatrix();

        this.m_dirty = true;  // Mark viewProjection matrix as dirty due to projection change
    }

    public GetViewProjectionMatrix(): Mat3 {
        this.updateViewMatrix();

        return this.m_view_projection_matrix;
    }

    /**
     * Converts a point in viewport coordinates (e.g. mouse position) to world coordinates.
     * @param viewportPoint The Vec2 representing the viewport (screen) coordinates.
     * @returns The corresponding world coordinates as a Vec2.
     */
    public ViewportToWorld(viewportPoint: Vec2): Vec2 {
        this.updateViewMatrix();

        // Normalize screen coordinates: (0,0) is at center, values between -1 and 1
        // const normalizedX = (viewportPoint[0] / this.m_canvas_size[0]) * 2 - 1;
        // const normalizedY = 1 - (viewportPoint[1] / this.m_canvas_size[1]) * 2; // Flip Y for screen space

        // Screen space point
        // const normalizedPoint = Vec2.fromValues(normalizedX, normalizedY);

        // Transform to world coordinates by multiplying with the inverse view-projection matrix
        const worldPoint = Vec2.create();
        // Vec2.transformMat3(worldPoint, normalizedPoint, this.m_inverse_view_projection_matrix);
        Vec2.transformMat3(worldPoint, viewportPoint, this.m_inverse_view_projection_matrix);

        return worldPoint;
    }

    private updateProjectionMatrix(): void {
        // Orthographic projection for 2D using canvas size
        // const halfWidth = this.m_canvas_size[0] / 2;
        // const halfHeight = this.m_canvas_size[1] / 2;

        Mat3.identity(this.m_projection_matrix);
        // Mat3.translate(this.m_projection_matrix, this.m_projection_matrix, [halfWidth, halfHeight]);
        // Mat3.scale(this.m_projection_matrix, this.m_projection_matrix, [1 / halfWidth, -1 / halfHeight]); // Y-axis is flipped for screen coordinates
    }

    private updateViewMatrix(): void {
        if (!this.m_dirty) return;

        // View Matrix: Translate, Rotate, and then Scale (Zoom)
        Mat3.identity(this.m_view_matrix);
        Mat3.translate(this.m_view_matrix, this.m_view_matrix, [-this.m_position[0], -this.m_position[1]]);
        Mat3.rotate(this.m_view_matrix, this.m_view_matrix, -this.m_rotation);
        Mat3.scale(this.m_view_matrix, this.m_view_matrix, [this.m_zoom, this.m_zoom]);

        // Combine View and Projection Matrices
        Mat3.multiply(this.m_view_projection_matrix, this.m_projection_matrix, this.m_view_matrix);

        // Also calculate the inverse for converting screen coordinates back to world coordinates
        Mat3.invert(this.m_inverse_view_projection_matrix, this.m_view_projection_matrix);

        this.m_dirty = false;
    }
}

export default Canvas2DCamera;