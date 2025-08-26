import BaseConfigInterface from "./BaseConfigInterface";
import RectangleInterface from "./RectangleInterface";

interface GlobalConfigInterface extends BaseConfigInterface {
    Canvas: RectangleInterface;
    Scale: number;
}

export default GlobalConfigInterface;